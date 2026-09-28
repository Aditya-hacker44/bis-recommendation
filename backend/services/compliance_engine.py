import re
from typing import List, Dict, Any

from services.recommendation_engine import get_recommendations

def extract_requirements(text: str) -> List[Dict[str, str]]:
    """
    Very basic heuristic extraction of technical parameters from the specification text.
    Extracts explicit requirements like 100W, IP66, 11kV, etc.
    """
    requirements = []
    
    # Power
    watt_match = re.search(r'(\d+)\s*(?:W|Watt|kW)s?', text, re.IGNORECASE)
    if watt_match:
        requirements.append({
            "requirement": "Power Rating",
            "submitted_value": watt_match.group(0),
            "unit": "W/kW",
            "source_text": text
        })
        
    # IP Rating
    ip_match = re.search(r'(IP\s*\d{2})', text, re.IGNORECASE)
    if ip_match:
        requirements.append({
            "requirement": "Ingress Protection",
            "submitted_value": ip_match.group(1).upper(),
            "unit": "IP",
            "source_text": text
        })
        
    # Voltage
    volt_match = re.search(r'(\d+)\s*(?:V|kV|Volts)', text, re.IGNORECASE)
    if volt_match:
        requirements.append({
            "requirement": "Voltage",
            "submitted_value": volt_match.group(0),
            "unit": "V/kV",
            "source_text": text
        })
        
    # Material (heuristic)
    materials = ["aluminium", "copper", "pvc", "steel", "plastic", "iron"]
    for mat in materials:
        if mat in text.lower():
            requirements.append({
                "requirement": "Material",
                "submitted_value": mat.capitalize(),
                "unit": "Type",
                "source_text": text
            })
            
    return requirements

def check_compliance(product_desc: str, tech_spec: str = "", recommended_standards: List[str] = None) -> Dict[str, Any]:
    full_text = f"{product_desc} {tech_spec}".strip()
    
    # 1. Automatic Recommendation if none supplied
    stds_to_eval = []
    if not recommended_standards:
        rec_res = get_recommendations(product_desc, top_k=3)
        if rec_res.get("status") == "SUCCESS":
            stds_to_eval = rec_res.get("primary_recommendations", []) + rec_res.get("alternative_recommendations", [])
    else:
        # In a real system, we would query the vector index or DB by IS number to get full metadata.
        # Since we just want to run the pipeline, we'll do a mock fetch using the recommendation engine
        for r_is in recommended_standards:
            # Query the recommendation engine with the exact IS number
            rec_res = get_recommendations(r_is, top_k=1)
            if rec_res.get("status") == "SUCCESS" and rec_res.get("primary_recommendations"):
                stds_to_eval.append(rec_res["primary_recommendations"][0])
            else:
                # Fallback dummy struct if we can't find it
                stds_to_eval.append({
                    "is_number": r_is,
                    "title": "DATA_NOT_AVAILABLE",
                    "department": "UNKNOWN"
                })

    # 2. Extract Requirements
    extracted_reqs = extract_requirements(full_text)
    
    # 3. Evaluate each standard
    evaluated_standards = []
    for std in stds_to_eval:
        req_results = []
        verified_count = 0
        
        # Check against available standard metadata (title)
        std_title_lower = std.get("title", "").lower()
        
        for req in extracted_reqs:
            sub_val_lower = req["submitted_value"].lower()
            
            # Since dataset mostly only has 'title', we check if the submitted value is explicitly stated in the title
            if sub_val_lower in std_title_lower:
                status = "COMPLIANT"
                evidence = f"Found '{req['submitted_value']}' in standard title."
                verified_count += 1
            else:
                # We strictly follow rules: NEVER EQUATE MISSING DATA WITH NON-COMPLIANCE
                status = "INSUFFICIENT_DATA"
                evidence = "Technical requirement is not explicitly verifiable from available standard metadata."
                
            req_results.append({
                "requirement": req["requirement"],
                "submitted_value": req["submitted_value"],
                "standard_evidence": evidence,
                "status": status
            })
            
        coverage_score = round(verified_count / max(1, len(extracted_reqs)), 2) if extracted_reqs else 0.0
        
        if len(extracted_reqs) == 0:
            overall_status = "INSUFFICIENT_DATA"
        elif coverage_score == 1.0:
            overall_status = "COMPLIANT"
        elif coverage_score > 0:
            overall_status = "PARTIALLY_COMPLIANT"
        else:
            overall_status = "INSUFFICIENT_DATA"
            
        evaluated_standards.append({
            "is_number": std.get("is_number"),
            "title": std.get("title"),
            "source_record_id": std.get("source_record_id", "DATA_NOT_AVAILABLE"),
            "source_file": std.get("source_file", "DATA_NOT_AVAILABLE"),
            "overall_status": overall_status,
            "coverage_score": coverage_score,
            "requirements": req_results,
            "missing_information": [
                "Detailed technical scope",
                "Normative cross-references",
                "Performance limits"
            ],
            "verification_required": [
                "Certification requirements not available in dataset.",
                "Version/edition recency requires external authoritative check."
            ]
        })
        
    return {
        "status": evaluated_standards[0]["overall_status"] if evaluated_standards else "INSUFFICIENT_DATA",
        "product": product_desc,
        "standards": evaluated_standards,
        "disclaimer": "Compliance results are based on the information available in the current dataset and should be verified against the latest authoritative BIS standard before final procurement use."
    }
