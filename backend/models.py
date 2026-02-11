"""
Pydantic v2 models for PrivacyGuard API
Single source of truth for response/request schemas.
"""

from enum import Enum
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RiskLevel(str, Enum):
    """Risk level enum - must match frontend EXACTLY."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class AnalyzeRequest(BaseModel):
    """Request for privacy analysis."""
    text: str
    title: Optional[str] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "We may share your personal information with third-party advertisers...",
                "title": "Sample Privacy Policy"
            }
        }
    }


class AnalyzeResponse(BaseModel):
    """Response from privacy analysis - must match frontend EXACTLY."""
    risk_score: int
    risk_level: str  # "Low", "Medium", or "High"
    red_flags: List[str]
    summary: str
    detected_keywords: List[str]
    recommendations: List[str]
    grade: str  # "A", "B", "C", "D", or "F"
    analyzed_at: str  # ISO timestamp
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "risk_score": 60,
                "risk_level": "Medium",
                "red_flags": ["third-party advertising"],
                "summary": "This text contains notable privacy concerns...",
                "detected_keywords": ["third-party advertisers", "targeted advertising"],
                "recommendations": ["Review the specific data collection..."],
                "grade": "C",
                "analyzed_at": "2024-01-15T10:30:00Z"
            }
        }
    }
