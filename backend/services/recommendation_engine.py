import json
import os
import re
from typing import List, Dict, Any
from pydantic import BaseModel

from services.vector_search import vector_service

class RecommendationConfig:
    # Weights for English and Hinglish (relying heavily on strong Multilingual E5 embeddings)
    W_SEMANTIC_EN = 0.85
    W_TITLE_EN = 0.05
    
    # Weights for Hindi/Marathi
    W_SEMANTIC_HI_MR = 0.90
    W_TITLE_HI_MR = 0.0
    
    W_CATEGORY = 0.05
    W_DEPARTMENT = 0.05
    W_METADATA = 0.0
    THRESHOLD_HIGH = 0.75
    THRESHOLD_MEDIUM = 0.65
    THRESHOLD_MIN = 0.50 # Lower threshold to allow descriptive and local language matches

def detect_language(query: str) -> str:
    if any('\u0900' <= c <= '\u097F' for c in query):
        # Rough heuristic to distinguish Marathi vs Hindi (Devanagari script)
        if any(word in query for word in ["साठी", "च्या", "आणि", "लाईट", "महानगरपालिकेच्या"]):
            return "mr"
        return "hi"
    if any('a' <= c.lower() <= 'z' for c in query):
        return "en"
    return "unknown"

def extract_intent(query: str) -> Dict[str, Any]:
    query_lower = query.lower()
    
    domain = None
    if any(word in query_lower for word in ["light", "led", "bulb", "lamp", "लाईट", "लाइट"]):
        domain = "lighting"
    elif any(word in query_lower for word in ["cable", "wire", "electrical", "voltage"]):
        domain = "electrical"
    elif any(word in query_lower for word in ["pump", "pipe", "water", "plumbing"]):
        domain = "mechanical/water"
        
    return {
        "product": query,
        "application": None,
        "domain": domain,
        "technical_terms": [word for word in query_lower.split() if len(word) > 4]
    }

def calculate_title_relevance(query: str, title: str, lang: str) -> float:
    if lang != "en":
        return 0.0 # lexical overlap is useless across languages, handled by semantic weight
    if not title:
        return 0.0
    query_words = set(re.findall(r'\w+', query.lower()))
    title_words = set(re.findall(r'\w+', title.lower()))
    if not query_words:
        return 0.0
    overlap = len(query_words.intersection(title_words))
    return min(1.0, overlap / max(1, len(query_words) * 0.5))

def calculate_metadata_relevance(candidate: Dict[str, Any]) -> float:
    # Boost slightly if it has more metadata (like cross_references or ics_code)
    score = 0.0
    if candidate.get("category"): score += 0.25
    if candidate.get("department"): score += 0.25
    # The vector service metadata doesn't have cross_refs. But it has category/dept.
    # So we'll just give a static small boost.
    return score

def re_rank_candidates(query: str, candidates: List[Dict[str, Any]], lang: str) -> List[Dict[str, Any]]:
    ranked = []
    
    w_sem = RecommendationConfig.W_SEMANTIC_EN if lang == "en" else RecommendationConfig.W_SEMANTIC_HI_MR
    w_tit = RecommendationConfig.W_TITLE_EN if lang == "en" else RecommendationConfig.W_TITLE_HI_MR
    
    for cand in candidates:
        semantic_score = cand.get("similarity_score", 0.0)
        
        title_rel = calculate_title_relevance(query, cand.get("title", ""), lang)
        cat_rel = 1.0 if cand.get("category") else 0.0
        dept_rel = 1.0 if cand.get("department") else 0.0
        meta_rel = calculate_metadata_relevance(cand)
        
        final_score = (
            semantic_score * w_sem +
            title_rel * w_tit +
            cat_rel * RecommendationConfig.W_CATEGORY +
            dept_rel * RecommendationConfig.W_DEPARTMENT +
            meta_rel * RecommendationConfig.W_METADATA
        )
        
        cand["final_score"] = round(final_score, 4)
        
        if final_score >= RecommendationConfig.THRESHOLD_HIGH:
            cand["relevance_level"] = "HIGH"
            reason_msg = "Directly applicable based on strong matches with the product specifications, materials, and intended application."
        elif final_score >= RecommendationConfig.THRESHOLD_MEDIUM:
            cand["relevance_level"] = "MEDIUM"
            reason_msg = "Potentially applicable based on partial matches with the product category or related technical terms."
        else:
            cand["relevance_level"] = "LOW"
            reason_msg = "Broadly related, but requires careful verification against exact product specifications."
            
        if lang != "en" and lang != "unknown":
            lang_name = "Hindi" if lang == "hi" else "Marathi" if lang == "mr" else lang
            reason_msg += f" (Matched via {lang_name} cross-lingual analysis)."
            
        cand["recommendation_reason"] = reason_msg
            
        ranked.append(cand)
        
    ranked.sort(key=lambda x: x["final_score"], reverse=True)
    return ranked

def get_recommendations(query: str, top_k: int = 5) -> Dict[str, Any]:
    # 1. Detect language & Extract Intent
    lang = detect_language(query)
    intent = extract_intent(query)
    
    # 2. Retrieve top 20 semantic candidates
    try:
        raw_candidates = vector_service.search_standards(query, top_k=20)
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}
        
    # 3. Re-rank
    ranked_candidates = re_rank_candidates(query, raw_candidates, lang)
    
    # 4. Check No Confident Match
    if not ranked_candidates or ranked_candidates[0]["final_score"] < RecommendationConfig.THRESHOLD_MIN:
        return {
            "status": "NO_CONFIDENT_MATCH",
            "message": "No sufficiently relevant Indian Standard was found in the current dataset.",
            "query": query,
            "query_language": lang,
            "scoring_method": "multilingual_semantic_reranking",
            "intent": intent,
            "primary_recommendations": [],
            "alternative_recommendations": [],
            "search_metadata": {
                "candidates_retrieved": len(raw_candidates),
                "recommendations_returned": 0
            }
        }
        
    # 5. Format Output
    primary_recs = []
    alternative_recs = []
    
    for i, rec in enumerate(ranked_candidates):
        std_detail = {
            "is_number": rec.get("is_number"),
            "title": rec.get("title"),
            "department": rec.get("department"),
            "category": rec.get("category"),
            "similarity_score": rec.get("similarity_score"),
            "final_score": rec.get("final_score"),
            "relevance_level": rec.get("relevance_level"),
            "recommendation_reason": rec.get("recommendation_reason"),
            "source_record_id": rec.get("source_record_id"),
            "source_file": rec.get("source_file"),
            "version_information": {
                "edition": rec.get("edition") if rec.get("edition") else "DATA_NOT_AVAILABLE",
                "status": rec.get("status") if rec.get("status") else "DATA_NOT_AVAILABLE"
            },
            "certification_information": {
                "status": "VERIFY_REQUIRED",
                "message": "Certification information is not available in the current dataset."
            },
            "related_standards": [],
            "normative_references": [],
            "test_standards": [],
            "safety_standards": [],
            "installation_standards": []
        }
        
        if i == 0 and rec["final_score"] >= RecommendationConfig.THRESHOLD_MEDIUM:
            primary_recs.append(std_detail)
        elif len(primary_recs) + len(alternative_recs) < top_k:
            alternative_recs.append(std_detail)

    return {
        "status": "SUCCESS",
        "query": query,
        "query_language": lang,
        "scoring_method": "multilingual_semantic_reranking" if lang != "en" else "lexical_semantic_reranking",
        "intent": intent,
        "primary_recommendations": primary_recs,
        "alternative_recommendations": alternative_recs,
        "search_metadata": {
            "candidates_retrieved": len(raw_candidates),
            "recommendations_returned": len(primary_recs) + len(alternative_recs)
        }
    }
