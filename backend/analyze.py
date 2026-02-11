"""
PrivacyGuard Analyzer - Single Source of Truth
Robust keyword detection, scoring, and analysis engine.
Pydantic v2 compatible.
"""

import re
import unicodedata
from typing import List, Dict, Set, Tuple
from models import AnalyzeResponse, RiskLevel


# =============================================================================
# KEYWORD DATABASE - All risky terms organized by category
# =============================================================================

RISKY_KEYWORDS: Dict[str, int] = {
    # === CRITICAL RISK (80-100) ===
    # Data selling
    "sell your data": 95,
    "sell your personal data": 95,
    "sell personal information": 95,
    "sell your information": 90,
    "sale of personal data": 95,
    "we may sell your data": 95,
    "monetize your data": 90,
    "data marketplace sales": 95,
    "data trading": 95,
    "data licensing": 90,
    
    # Data brokers
    "data brokers": 95,
    "share with data brokers": 95,
    "data broker sharing": 95,
    
    # Location tracking
    "track your location": 90,
    "track your location data": 95,
    "tracking your location": 90,
    "location tracking": 95,
    "continuous location tracking": 95,
    "background gps collection": 90,
    "precise geolocation": 95,
    "live gps data": 95,
    "monitor your activities": 85,
    
    # Biometric data
    "biometric data": 95,
    "biometric identifiers": 95,
    "face recognition": 95,
    "facial geometry": 90,
    "fingerprint scan": 95,
    "fingerprint": 90,
    "iris scan": 95,
    "retina scan": 95,
    "genetic data": 95,
    "genomic profile": 95,
    "dna profiling": 95,
    
    # Third-party sharing
    "share your personal information": 95,
    "share your personal data": 95,
    "share your information": 90,
    "share personal information": 95,
    "share personal data": 95,
    "share with third parties": 95,
    "shared with third parties": 95,
    "disclose to third parties": 90,
    "third-party advertisers": 90,
    "third-party advertising": 90,
    "third-party ad partners": 90,
    "advertisers for marketing": 85,
    "advertising partners": 90,
    "marketing partners": 90,
    "shared with advertisers": 95,
    "shared with partners": 90,
    "shared with affiliates": 90,
    
    # Indefinite retention
    "retain your data indefinitely": 95,
    "retain data indefinitely": 95,
    "data retention indefinitely": 90,
    "keep your data forever": 95,
    "store data indefinitely": 90,
    
    # === HIGH RISK (60-80) ===
    # Targeted advertising
    "targeted marketing": 85,
    "targeted advertising": 85,
    "targeted ads": 80,
    "behavioral advertising": 80,
    "targeted behavioral advertising": 90,
    "interest-based advertising": 75,
    
    # Data combining
    "combine your information": 85,
    "combine information with": 85,
    "combine data with": 85,
    "combine your data": 85,
    "combine with external": 85,
    "external data sources": 85,
    "external sources": 75,
    
    # Profiling
    "profiling": 80,
    "user profiling": 85,
    "behavioral profiling": 85,
    "marketing profiling": 80,
    "continuous behavioral profiling": 90,
    "algorithmic profiling": 90,
    "ai-driven profiling": 85,
    "behavioral prediction": 75,
    
    # Personalized content
    "personalized advertising": 85,
    "personalized suggestions": 70,
    "personalized recommendations": 70,
    "personalized content": 65,
    
    # Third-party tracking
    "third-party ad tracking": 85,
    "cross-app tracking": 90,
    "device fingerprinting": 90,
    "browser fingerprinting": 90,
    "cross-device linking": 75,
    "multi-device tracking": 75,
    
    # Data sharing
    "data sharing with partners": 90,
    "sharing data for marketing": 75,
    "using your data for advertising": 75,
    "profiling for marketing purposes": 80,
    "third-party data access": 90,
    "transfer to affiliates": 85,
    "sell to partners": 90,
    "location sharing with partners": 85,
    
    # Marketing purposes
    "marketing purposes": 75,
    "advertising purposes": 75,
    "analysis purposes": 70,
    "research purposes": 65,
    
    # Financial/Identity
    "social security number": 95,
    "credit card number": 95,
    "bank account information": 90,
    "financial identifiers": 90,
    "billing information": 85,
    "identity documents": 95,
    
    # === MEDIUM RISK (40-60) ===
    "purchase history": 70,
    "contact information": 70,
    "email address": 65,
    "mailing address": 65,
    "analytics partners": 75,
    "analytics tools": 55,
    "third-party tools": 50,
    "tracking technologies": 55,
    "tracking cookies": 50,
    "third-party cookies": 70,
    "pixel tracking": 55,
    "tracking pixels": 85,
    
    # === LOW RISK (20-40) ===
    "service providers": 50,
    "trusted vendors": 45,
    "general information": 30,
    "service improvements": 25,
    "product enhancement": 30,
    "technical diagnostics": 25,
    "basic analytics": 30,
    "improve our services": 30,
    "enhance user experience": 35,
    "non-identifiable information": 25,
    "anonymous usage statistics": 30,
}


# Red flag categories for recommendations
RED_FLAG_CATEGORIES = {
    "location": [
        "location tracking", "track your location", "tracking your location",
        "continuous location tracking", "background gps collection", "precise geolocation",
        "monitor your activities"
    ],
    "biometric": [
        "biometric data", "biometric identifiers", "face recognition", "facial geometry",
        "fingerprint scan", "fingerprint", "iris scan", "retina scan",
        "genetic data", "genomic profile", "dna profiling"
    ],
    "financial": [
        "social security number", "credit card number", "bank account information",
        "financial identifiers", "billing information", "identity documents"
    ],
    "third_party_sharing": [
        "share with third parties", "shared with third parties", "third-party advertisers",
        "third-party advertising", "third-party ad partners", "advertising partners",
        "marketing partners", "shared with advertisers", "shared with partners",
        "shared with affiliates", "third-party data access", "data sharing with partners"
    ],
    "data_selling": [
        "sell your data", "sell your personal data", "sell personal information",
        "sell your information", "sale of personal data", "we may sell your data",
        "monetize your data", "data marketplace sales", "data trading",
        "data brokers", "share with data brokers", "data broker sharing"
    ],
    "indefinite_retention": [
        "retain your data indefinitely", "retain data indefinitely",
        "data retention indefinitely", "keep your data forever",
        "store data indefinitely"
    ]
}


# =============================================================================
# TEXT NORMALIZATION
# =============================================================================

def normalize_text(text: str) -> str:
    """
    Normalize text for consistent keyword matching:
    - Lowercase
    - Remove Unicode punctuation (smart quotes, dashes)
    - Remove extra whitespace
    - Remove special characters
    """
    # Convert to lowercase
    text = text.lower()
    
    # Replace smart quotes and apostrophes with regular ones
    text = text.replace("'", "'").replace("'", "'")
    text = text.replace('"', '"').replace('"', '"')
    
    # Replace Unicode dashes with regular hyphen
    text = text.replace("–", "-").replace("—", "-")
    
    # Remove other Unicode punctuation
    text = re.sub(r"[''""'''''']", "'", text)  # various quote styles
    text = re.sub(r"[–—─━━]", "-", text)  # various dash styles
    
    # Remove punctuation except spaces and alphanumerics
    text = re.sub(r"[^\w\s]", " ", text)
    
    # Replace multiple spaces with single space
    text = re.sub(r"\s+", " ", text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def extract_keywords_from_text(text: str) -> List[str]:
    """
    Extract all risky keywords found in the normalized text.
    Returns unique keywords sorted by their order in RISKY_KEYWORDS.
    """
    normalized_text = normalize_text(text)
    detected_keywords: Set[str] = set()
    
    # Sort keywords by length (longest first) for proper matching
    sorted_keywords = sorted(RISKY_KEYWORDS.keys(), key=len, reverse=True)
    
    for keyword in sorted_keywords:
        # Create regex pattern for whole phrase matching
        # Escape special regex characters
        escaped_keyword = re.escape(keyword)
        # Allow for word boundaries
        pattern = r'\b' + escaped_keyword + r'\b'
        
        if re.search(pattern, normalized_text):
            detected_keywords.add(keyword)
    
    # Return list maintaining original order from RISKY_KEYWORDS
    result = [kw for kw in sorted_keywords if kw in detected_keywords]
    return result


# =============================================================================
# SCORING & GRADING
# =============================================================================

def calculate_risk_score(detected_keywords: List[str]) -> int:
    """
    Calculate risk score from detected keywords.
    Score = min(unique_detected_terms * 20, 100)
    """
    if not detected_keywords:
        return 0
    
    unique_count = len(set(detected_keywords))
    score = min(unique_count * 20, 100)
    return score


def get_grade(score: int) -> str:
    """
    Get letter grade from risk score.
    Must match frontend utils.ts EXACTLY:
    0-20 → A
    21-40 → B
    41-60 → C
    61-80 → D
    81-100 → F
    """
    if score <= 20:
        return "A"
    elif score <= 40:
        return "B"
    elif score <= 60:
        return "C"
    elif score <= 80:
        return "D"
    else:
        return "F"


def get_risk_level(score: int) -> str:
    """
    Get risk level from score.
    Must match frontend utils.ts EXACTLY:
    0-40 → Low
    41-70 → Medium
    71-100 → High
    """
    if score <= 40:
        return "Low"
    elif score <= 70:
        return "Medium"
    else:
        return "High"


# =============================================================================
# RED FLAGS & RECOMMENDATIONS
# =============================================================================

def identify_red_flags(detected_keywords: List[str]) -> List[str]:
    """
    Identify red flags from detected keywords.
    Returns unique red flags based on keyword categories.
    """
    red_flags: Set[str] = set()
    normalized_keywords = [normalize_text(kw) for kw in detected_keywords]
    normalized_combined = " ".join(normalized_keywords)
    
    # Check each category
    for category, keywords in RED_FLAG_CATEGORIES.items():
        for keyword in keywords:
            normalized_keyword = normalize_text(keyword)
            if normalized_keyword in normalized_combined or keyword in detected_keywords:
                # Add the matched keyword as a red flag
                red_flags.add(keyword)
                break  # Only need one match per category
    
    return list(red_flags)


def generate_recommendations(red_flags: List[str], risk_level: str) -> List[str]:
    """
    Generate recommendations based on red flags and risk level.
    Returns up to 5 recommendations.
    """
    recommendations: List[str] = []
    normalized_red_flags = [normalize_text(rf) for rf in red_flags]
    combined_red_flags = " ".join(normalized_red_flags)
    
    # High risk recommendations
    if risk_level == "High":
        recommendations.append(
            "This policy contains significant privacy risks. Consider using an alternative service if possible."
        )
        recommendations.append(
            "Do not agree until you fully understand how your data will be used."
        )
    
    # Medium risk recommendations
    if risk_level == "Medium":
        recommendations.append(
            "Review the specific data collection practices before accepting."
        )
    
    # Category-specific recommendations
    if any(cat in combined_red_flags for cat in RED_FLAG_CATEGORIES["location"]):
        recommendations.append(
            "Consider disabling location services when not actively needed."
        )
    
    if any(cat in combined_red_flags for cat in RED_FLAG_CATEGORIES["biometric"]):
        recommendations.append(
            "Be cautious with biometric data - it cannot be changed if compromised."
        )
    
    if any(cat in combined_red_flags for cat in RED_FLAG_CATEGORIES["financial"]):
        recommendations.append(
            "Never provide financial information unless absolutely necessary."
        )
    
    if any(cat in combined_red_flags for cat in RED_FLAG_CATEGORIES["third_party_sharing"]):
        recommendations.append(
            "Check the privacy policies of third-party partners involved."
        )
        recommendations.append(
            "Understand how your data may be shared with advertisers."
        )
    
    if any(cat in combined_red_flags for cat in RED_FLAG_CATEGORIES["data_selling"]):
        recommendations.append(
            "Be aware that your data may be sold to or shared with data brokers."
        )
    
    if any(cat in combined_red_flags for cat in RED_FLAG_CATEGORIES["indefinite_retention"]):
        recommendations.append(
            "Data retention policies are unclear - your data may be kept permanently."
        )
    
    # Generic recommendation if no specific ones
    if not recommendations:
        recommendations.append(
            "Continue to monitor privacy practices as policies may change."
        )
    
    return recommendations[:5]


# =============================================================================
# SUMMARY GENERATION
# =============================================================================

def generate_summary(
    text: str,
    detected_keywords: List[str],
    score: int,
    risk_level: str
) -> str:
    """
    Generate a summary based on findings.
    Summary must reflect the true score and risk level.
    """
    count = len(detected_keywords)
    
    # Level description based on risk level
    if risk_level == "Low":
        level_desc = "This text appears to have minimal privacy concerns."
    elif risk_level == "Medium":
        level_desc = "This text contains notable privacy concerns that should be reviewed carefully."
    else:  # High
        level_desc = "This text contains significant privacy risks that require immediate attention."
    
    summary_parts = [level_desc]
    
    if count > 0:
        summary_parts.append(
            f" Found {count} privacy-related term{'s' if count != 1 else ''}."
        )
        
        # Add top 5 concerns by weight
        weighted_terms = [
            (kw, RISKY_KEYWORDS.get(kw, 50)) 
            for kw in detected_keywords
        ]
        weighted_terms.sort(key=lambda x: x[1], reverse=True)
        top_terms = [term for term, _ in weighted_terms[:5]]
        
        summary_parts.append(f" Top concerns: {', '.join(top_terms)}.")
    
    return "".join(summary_parts)


# =============================================================================
# MAIN ANALYSIS FUNCTION
# =============================================================================

def analyze_text(text: str) -> Dict:
    """
    Main analysis function - returns all analysis data as dictionary.
    This is the single source of truth for all analysis logic.
    """
    # Handle empty or whitespace-only text
    if not text or not text.strip():
        return {
            "risk_score": 0,
            "risk_level": "Low",
            "red_flags": [],
            "summary": "No text provided for analysis.",
            "detected_keywords": [],
            "recommendations": ["Please provide text to analyze for privacy risks."],
            "grade": "A",
            "analyzed_at": ""
        }
    
    # Extract keywords using normalized text
    detected_keywords = extract_keywords_from_text(text)
    
    # Calculate score
    risk_score = calculate_risk_score(detected_keywords)
    
    # Get grade and risk level
    grade = get_grade(risk_score)
    risk_level = get_risk_level(risk_score)
    
    # Identify red flags
    red_flags = identify_red_flags(detected_keywords)
    
    # Generate recommendations
    recommendations = generate_recommendations(red_flags, risk_level)
    
    # Generate summary
    summary = generate_summary(text, detected_keywords, risk_score, risk_level)
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "red_flags": red_flags,
        "summary": summary,
        "detected_keywords": detected_keywords,
        "recommendations": recommendations,
        "grade": grade,
        "analyzed_at": ""  # Will be set by caller
    }


def create_analysis_response(text: str) -> Dict:
    """
    Create a complete analysis response dictionary.
    """
    result = analyze_text(text)
    from datetime import datetime
    result["analyzed_at"] = datetime.utcnow().isoformat() + "Z"
    return result
