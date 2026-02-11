"""
PrivacyGuard Backend - FastAPI Server
NLP-based privacy analysis endpoints.
Pydantic v2 compatible.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

from analyze import create_analysis_response
from models import AnalyzeRequest, AnalyzeResponse


# =============================================================================
# FASTAPI APP
# =============================================================================

app = FastAPI(
    title="PrivacyGuard API",
    description="AI-powered privacy policy analysis",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# LOGGING
# =============================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "PrivacyGuard API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "POST /analyze": "Analyze text for privacy risks",
            "GET /health": "Health check"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Analyze text for privacy risks.
    
    Provide a privacy policy, terms of service, or any text
    to receive a comprehensive privacy risk analysis.
    
    Returns:
        AnalyzeResponse with risk_score, risk_level, red_flags,
        summary, detected_keywords, recommendations, grade, and analyzed_at
    """
    logger.info(f"Received text for analysis: {request.text[:100]}...")
    
    # Validate input
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=400, 
            detail="Text is required for analysis"
        )
    
    # Run analysis using single source of truth
    result = create_analysis_response(request.text)
    
    logger.info(f"Analysis complete:")
    logger.info(f"  - Risk score: {result['risk_score']}")
    logger.info(f"  - Risk level: {result['risk_level']}")
    logger.info(f"  - Grade: {result['grade']}")
    logger.info(f"  - Detected keywords: {result['detected_keywords']}")
    logger.info(f"  - Red flags: {result['red_flags']}")
    
    # Return response matching frontend expectations
    return AnalyzeResponse(
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        red_flags=result["red_flags"],
        summary=result["summary"],
        detected_keywords=result["detected_keywords"],
        recommendations=result["recommendations"],
        grade=result["grade"],
        analyzed_at=result["analyzed_at"]
    )


# =============================================================================
# RUN SERVER
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
