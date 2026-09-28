from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import UploadFile, File
import io
import traceback

# Local imports (mocked paths for the other agents' outputs)
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from retrieval.search import search
from retrieval.calibrate import calibrate, get_calibration_metadata
from retrieval.sector_classifier import classify_sector
from db.graph_traversal import get_standard_subgraph
from api.validation import validate_is_numbers
from api.audit_trail import log_evaluation, get_evaluation, list_recent_evaluations
from api.report_generator import generate_government_report

from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="IS-Recommend API",
    description="AI Recommendation engine for Indian Standards",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure clause_gen/examples directory exists before mounting
examples_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "clause_gen", "examples")
os.makedirs(examples_dir, exist_ok=True)
app.mount("/downloads", StaticFiles(directory=examples_dir), name="downloads")

@app.get("/")
async def root():
    return {"message": "IS-Recommend API Backend is running perfectly! Please use the frontend at https://sih-2026-xa6n-nine.vercel.app"}

# --- Pydantic Schemas ---

class RecommendRequest(BaseModel):
    query: str
    language: Optional[str] = "en"

class SearchResultSchema(BaseModel):
    standard_id: str
    is_number: Optional[str]
    score: float
    confidence: Optional[float] = None
    confidence_label: Optional[str] = None
    # Metadata fields from Agent B would go here
    status: Optional[str] = "live"
    source_url: Optional[str] = "https://services.bis.gov.in"
    retrieved_at: Optional[str] = datetime.utcnow().isoformat()

class ClauseRequest(BaseModel):
    standard_ids: List[str]

class AuditRequest(BaseModel):
    tender_text: str

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 10
    department: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    is_number: Optional[str] = None

# --- API Endpoints ---

class RecommendRequestAPI(BaseModel):
    query: str
    department: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = "en"
    top_k: Optional[int] = 5

class ComplianceRequestAPI(BaseModel):
    product_description: str
    technical_specification: Optional[str] = ""
    recommended_standards: Optional[list[str]] = None

@app.post("/api/compliance/check")
async def get_compliance_check(request: ComplianceRequestAPI):
    try:
        from services.compliance_engine import check_compliance
        result = check_compliance(
            product_desc=request.product_description,
            tech_spec=request.technical_specification,
            recommended_standards=request.recommended_standards
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommend")
async def get_recommendation_api(request: RecommendRequestAPI, req: Request = None):
    try:
        from services.recommendation_engine import get_recommendations
        result = get_recommendations(request.query, request.top_k)
        
        # Optionally log audit here if Agent J is needed
        # audit_id = log_evaluation(...)
        
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract_text")
async def extract_text_api(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename.lower()
        text = ""

        if filename.endswith(".pdf"):
            from pypdf import PdfReader
            pdf_reader = PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                text += (page.extract_text() or "") + "\n"
        elif filename.endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join([para.text for para in doc.paragraphs])
        else:
            text = content.decode('utf-8', errors='ignore')

        if not text.strip():
            raise ValueError("No text could be extracted.")

        return {"success": True, "text": text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/standards/{id}/graph")
async def get_graph(id: str):
    """
    Returns the allied-standards subgraph for Cytoscape.js rendering.
    Delegates to Agent B's graph traversal logic.
    """
    graph_data = get_standard_subgraph(is_number=id, hops=2)
    safe_graph_data = validate_is_numbers(graph_data)
    return safe_graph_data

@app.get("/standards/{id}/certification")
async def get_certification(id: str):
    """
    Returns mandatory certification requirements (ISI/CRS/Hallmarking).
    """
    # Mocking Agent B's certification lookup
    cert_data = {
        "standard_id": id,
        "cert_type": "ISI Mark",
        "mandatory_bool": True,
        "qco_reference": "QCO-1234",
        "source_url": "https://services.bis.gov.in",
        "retrieved_at": datetime.utcnow().isoformat()
    }
    return cert_data

from clause_gen.generate_clause import create_clause

@app.post("/clause")
async def generate_clause_api(request: ClauseRequest, req: Request = None):
    """
    Generates a tender clause based on the selected standards.
    Delegates to Agent G (Clause Generator).
    Now includes: audit_id (Agent J).
    """
    try:
        # Call the real clause generation logic
        clause_data = create_clause(request.standard_ids)
        safe_clause_data = validate_is_numbers(clause_data)

        # Agent J: Log evaluation
        audit_id = log_evaluation(
            endpoint="/clause",
            input_query=str(request.standard_ids),
            output_summary=safe_clause_data,
            source_urls=["https://services.bis.gov.in"],
            session_id=req.headers.get("X-Session-Id") if req else None,
        )
        safe_clause_data["audit_id"] = audit_id

        return safe_clause_data
    except Exception as e:
        print(f"Error generating clause: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/audit")
async def audit_tender(request: AuditRequest, req: Request = None):
    """
    Audits raw tender text for non-compliance and staleness.
    Delegates to Agent H (Audit Dashboard Pipeline).
    Now includes: audit_id (Agent J).
    """
    # Import Agent H's real analysis
    from audit.run_audit import analyze_tender

    issues = analyze_tender(request.tender_text)

    audit_data = {"flagged_issues": issues}
    safe_audit_data = validate_is_numbers(audit_data)

    source_urls = [i.get("source_url", "") for i in issues if i.get("source_url")]

    # Agent J: Log evaluation
    audit_id = log_evaluation(
        endpoint="/audit",
        input_query=request.tender_text[:500],  # truncate for storage
        output_summary=safe_audit_data,
        source_urls=source_urls,
        session_id=req.headers.get("X-Session-Id") if req else None,
    )
    safe_audit_data["audit_id"] = audit_id

    return safe_audit_data

@app.post("/api/standards/search")
async def semantic_search(request: SearchRequest):
    if not request.query or len(request.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query too short or empty")
        
    filters = {}
    if request.department: filters["department"] = request.department
    if request.category: filters["category"] = request.category
    if request.status: filters["status"] = request.status
    if request.is_number: filters["is_number"] = request.is_number
        
    try:
        from services.vector_search import vector_service
        if not vector_service.is_available():
            raise HTTPException(status_code=503, detail="Vector index or embedding model unavailable")
            
        results = vector_service.search_standards(request.query, top_k=request.top_k, filters=filters)
        return {
            "query": request.query,
            "total_results": len(results),
            "results": results
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/standards/directory")
async def get_directory(
    department: Optional[str] = None, 
    status: Optional[str] = None,
    standard_type: Optional[str] = None,
    year: Optional[str] = None,
    page: int = 1, 
    limit: int = 50
):
    try:
        from services.vector_search import vector_service
        if not vector_service.is_available():
            raise HTTPException(status_code=503, detail="Vector index unavailable")
            
        all_metadata = vector_service.metadata
        
        # Get unique departments (categories)
        departments = sorted(list(set([m.get("department") for m in all_metadata if m.get("department")])))
        
        filtered = all_metadata
        # Filter by department
        if department and department != "All Departments":
            filtered = [m for m in filtered if m.get("department") == department]
            
        # Filter by status (mocked mapping since DB lacks good status)
        if status and status != "All":
            # For demo, if "Active", we just keep all since they are mocked as Active
            # If "Revised" or "Withdrawn", maybe return empty or just some dummy filter
            if status == "Revised":
                filtered = [m for m in filtered if "rev" in str(m.get("title") or "").lower()]
            elif status == "Withdrawn":
                filtered = [m for m in filtered if "withdrawn" in str(m.get("title") or "").lower()]
                
        # Filter by standard_type
        if standard_type:
            types = [t.strip().lower().replace(" standard", "") for t in standard_type.split(',')]
            # Map UI types to DB categories: e.g. "product" -> "product specification", "test method" -> "methods of tests"
            filtered = [m for m in filtered if any(t in str(m.get("category") or "").lower() or t in str(m.get("title") or "").lower() for t in types)]
            
        # Filter by year
        if year and year != "All Years":
            filtered = [m for m in filtered if str(m.get("edition") or "") == year or year in str(m.get("is_number") or "")]
            
        # Sort to ensure items with actual data appear first
        def has_data(m):
            return bool(m.get("is_number") and str(m.get("is_number")).strip() and m.get("title") and str(m.get("title")).strip())
        
        filtered = sorted(filtered, key=lambda m: (0 if has_data(m) else 1, m.get("is_number") or ""))
        
        # Pagination
        start = (page - 1) * limit
        end = start + limit
        paginated = filtered[start:end]
        
        return {
            "departments": departments,
            "total_results": len(filtered),
            "page": page,
            "limit": limit,
            "results": [{
                "id": m.get("is_number"),
                "title": m.get("title"),
                "category": m.get("department"),
                "status": "Active", # master DB doesn't have reliable status for all, so mocked as Active
                "version": m.get("edition", "2023")
            } for m in paginated]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    import os
    try:
        from services.vector_search import vector_service
        is_vector_loaded = vector_service.is_available()
        indexed_records = vector_service.get_indexed_count() if is_vector_loaded else 0
    except:
        is_vector_loaded = False
        indexed_records = 0
        
    return {
        "backend": True,
        "dataset": os.path.exists("data/processed/normalized_standards.json"),
        "vector_index": os.path.exists("data/vector_store/faiss_index.bin"),
        "embedding_model": is_vector_loaded,
        "indexed_records": indexed_records
    }

# --- Agent J: Audit Log Lookup Endpoint ---

@app.get("/audit-log/{audit_id}")
async def lookup_audit_log(audit_id: str):
    """
    Returns the full evaluation record for a given audit_id.
    This is strictly stronger than a static certificate because it's
    independently re-fetchable and tied to real source data.
    """
    record = get_evaluation(audit_id)
    if not record:
        raise HTTPException(status_code=404, detail="Audit ID not found")
    return record

@app.get("/audit-log")
async def list_audit_logs(limit: int = 20):
    """Returns recent evaluation audit logs."""
    return list_recent_evaluations(limit=limit)

# --- Report Generation Endpoint ---
class ReportRequest(BaseModel):
    report_data: dict

@app.post("/api/generate_report")
async def generate_report_endpoint(req: ReportRequest):
    """Generates a PDF report using reportlab"""
    try:
        pdf_buffer = generate_government_report(req.report_data)
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f'attachment; filename="report_{req.report_data.get("id", "summary")}.pdf"'}
        )
    except Exception as e:
        print("Error generating report:", e)
        raise HTTPException(status_code=500, detail=str(e))
