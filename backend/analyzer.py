"""
NLP-based Privacy Risk Analyzer
Analyzes text for privacy risks using keyword-based detection and weighted scoring.
Pydantic v2 compatible.
"""

import re
import unicodedata
from typing import List, Dict, Any
from models import AnalysisResult, RiskLevel


# Risk keywords with their weights (0-100)
PRIVACY_KEYWORDS = {

    # ----------------------------
    # CRITICAL RISK (80–100)
    # ----------------------------
    "continuous location tracking": 95,
    "background gps collection": 90,
    "location monitoring": 90,
    "live gps data": 95,
    "precise geolocation": 95,
    "ip-based geolocation": 90,
    "wifi-based location": 85,
    "bluetooth beacon tracking": 90,
    "nearby device tracking": 85,
    "movement tracking": 90,
    "motion sensor data": 85,
    "accelerometer tracking": 85,
    "gyroscope tracking": 85,
    "sensor fusion data": 90,
    "biometric identifiers": 95,
    "biometric authentication": 85,
    "facial geometry": 90,
    "face biometric template": 95,
    "voiceprint data": 85,
    "iris scan": 95,
    "retina scan": 95,
    "palm scan": 85,
    "vein pattern": 90,
    "finger vein": 90,
    "keystroke biometrics": 85,
    "behavioral biometrics": 85,
    "genetic sequencing": 95,
    "genomic profile": 95,
    "health biometric": 85,
    "dna profiling": 95,
    "financial identifiers": 90,
    "banking credentials": 95,
    "upi id": 90,
    "debit card number": 95,
    "cvv code": 95,
    "billing information": 85,
    "financial records": 85,
    "credit information": 85,
    "fraud detection data": 85,
    "identity documents": 95,
    "passport number": 95,
    "aadhar number": 95,
    "pan number": 95,
    "national id number": 95,
    "government identification": 90,
    "tax identification": 90,
    "ssn": 95,
    "medical information": 85,
    "electronic health records": 90,
    "insurance records": 85,
    "clinical data": 85,
    "device surveillance": 90,
    "continuous audio recording": 95,
    "background microphone access": 95,
    "ambient sound collection": 90,
    "voice monitoring": 90,
    "camera surveillance": 90,
    "background camera access": 95,
    "screen recording": 95,
    "background screen capture": 95,
    "clipboard monitoring": 90,
    "keylogging behavior": 95,
    "remote device control": 95,
    "remote configuration": 90,
    "root access request": 95,
    "administrator-level permissions": 95,
    "system settings modification": 90,
    "install unknown apps": 85,
    "device ownership tracking": 85,
    "network packet inspection": 90,
    "deep packet inspection": 95,
    "ssl interception": 95,
    "vpn data logging": 90,
    "proxy interception": 85,
    "metadata surveillance": 85,
    "session replay technology": 90,
    "user interaction recording": 90,
    "screen activity logging": 95,
    "sensitive personal information": 85,
    "continuous behavioral profiling": 90,
    "real-time user monitoring": 95,
    "third-party ad tracking": 85,
    "cross-app tracking": 90,
    "device fingerprinting": 90,
    "browser fingerprinting": 90,
    "supercookies": 90,
    "evercookies": 90,
    "canvas fingerprinting": 85,
    "webgl fingerprinting": 85,
    "audio fingerprinting": 85,
    "telemetry collection": 85,
    "ai-driven profiling": 85,
    "algorithmic profiling": 90,
    "location sharing with partners": 85,
    "data broker sharing": 95,
    "programmatic advertising": 85,
    "data marketplace sales": 95,
    "sell personal data": 95,
    "monetize your data": 90,
    "data licensing": 90,
    "data trading": 95,
    "tracking pixels": 85,
    "targeted behavioral advertising": 90,
    "third-party sdk collection": 90,
    "unauthorized data access": 95,
    "cross-border data transfer": 85,

    # ----------------------------
    # ADDED REAL PHRASES (CRITICAL)
    # ----------------------------
    "disclose information": 90,
    "share information": 90,
    "shared with affiliates": 90,
    "shared with third parties": 95,
    "shared with advertisers": 95,
    "shared with partners": 90,
    "advertising partners": 90,
    "marketing partners": 90,
    "third-party data access": 90,
    "data sharing with partners": 90,
    "sale of personal data": 95,
    "we may sell your data": 95,
    "we may monetize your information": 90,
    "we may transfer your data": 90,
    "data disclosure": 85,
    "personal data disclosure": 85,
    "transfer your information": 85,
    "data brokers": 95,
    "data enrichment partners": 85,

    # ----------------------------
    # USER-PROVIDED HIGH-RISK PHRASES (CRITICAL)
    # ----------------------------
    "share your personal information": 95,
    "share your personal data": 95,
    "share your information": 90,
    "share personal information": 95,
    "share personal data": 95,
    "third-party advertisers": 90,
    "advertisers for marketing": 85,
    "third-party advertising": 90,
    "third-party ad partners": 90,
    "track your location": 90,
    "track your location data": 95,
    "track your movements": 90,
    "tracking your location": 90,
    "location tracking": 95,
    "retain your data indefinitely": 95,
    "retain data indefinitely": 95,
    "data retention indefinitely": 90,
    "keep your data forever": 95,
    "store data indefinitely": 90,
    "targeted marketing": 85,
    "targeted advertising": 85,
    "targeted ads": 80,
    "combine your information": 85,
    "combine information with": 85,
    "combine data with": 85,
    "combine your data": 85,
    "external sources": 75,
    "external data sources": 85,
    "combine with external": 85,
    "sell your data": 95,
    "sell your personal data": 95,
    "sell personal information": 95,
    "sell your information": 90,
    "data brokers": 95,
    "share with data brokers": 95,
    "profiling": 80,
    "user profiling": 85,
    "behavioral profiling": 85,
    "marketing profiling": 80,
    "personalized suggestions": 70,
    "personalized recommendations": 70,
    "personalized content": 65,
    "personalized advertising": 85,

    # ----------------------------
    # HIGH RISK (60–80)
    # ----------------------------
    "persistent tracking": 75,
    "session tracking": 70,
    "interest-based advertising": 75,
    "activity monitoring": 70,
    "keystroke monitoring": 75,
    "third-party cookies": 70,
    "unique identifier": 65,
    "mobile advertising id": 70,
    "idfa collection": 75,
    "android advertising id": 70,
    "telemetry logging": 70,
    "event captures": 65,
    "heatmap analytics": 75,
    "cursor tracking": 70,
    "gesture tracking": 70,
    "multi-device tracking": 75,
    "cross-device linking": 75,
    "audience retargeting": 75,
    "behavioral prediction": 75,

    # ADDED HIGH-RISK REAL PHRASES
    "purchase history": 70,
    "purchases": 60,
    "contact information": 70,
    "email address": 65,
    "mailing address": 65,
    "sharing data for marketing": 75,
    "using your data for advertising": 75,
    "behavioral advertising": 80,
    "profiling for marketing purposes": 80,
    "analytics partners": 75,

    # ----------------------------
    # MEDIUM RISK (40–60)
    # ----------------------------
    "ip logging": 55,
    "region detection": 45,
    "device specs": 50,
    "browser fingerprint": 55,
    "tracking cookies": 50,
    "pixel tracking": 55,
    "utm tracking": 55,
    "event logging": 50,
    "page view analytics": 50,

    # ADDED MEDIUM RISK REAL PHRASES
    "service providers": 50,
    "trusted vendors": 45,
    "analytics tools": 55,
    "third-party tools": 50,
    "tracking technologies": 55,

    # ----------------------------
    # LOW RISK (20–40)
    # ----------------------------
    "general information": 30,
    "service improvements": 25,
    "product enhancement": 30,
    "technical diagnostics": 25,

    # ADDED LOW RISK REAL PHRASES
    "basic analytics": 30,
    "improve our services": 30,
    "enhance user experience": 35,
    "non-identifiable information": 25,
    "anonymous usage statistics": 30,
}


def normalize_text(text: str) -> str:
    """
    Normalize Unicode text by:
    - Converting smart quotes to regular quotes
    - Converting curly apostrophes to straight apostrophes
    - Converting unicode dashes to regular hyphens
    - Normalizing to NFKD form
    """
    # Replace smart quotes and apostrophes
    text = text.replace("'", "'").replace("'", "'")  # curly apostrophes
    text = text.replace('"', '"').replace('"', '"')  # curly quotes
    text = text.replace("–", "-").replace("—", "-")  # unicode dashes
    
    # Normalize unicode to NFKD form (decomposes characters)
    text = unicodedata.normalize("NFKD", text)
    
    # Remove combining characters that were separated
    # This handles the case where accented characters are decomposed
    text = "".join(c for c in text if not unicodedata.combining(c))
    
    return text


class PrivacyAnalyzer:
    """Analyzes text for privacy risks using keyword detection and scoring."""
    
    def __init__(self):
        self.keywords = PRIVACY_KEYWORDS
        self.red_flag_keywords = self._identify_red_flags()
        # Compile regex patterns for more flexible matching
        self._compile_patterns()

    def _compile_patterns(self):
        """Compile regex patterns for more flexible keyword matching."""
        self.patterns = {}
        for keyword in self.keywords:
            # Escape special regex characters and create pattern
            # Allow for word boundaries and flexible whitespace
            escaped = re.escape(keyword)
            # Replace escaped spaces with optional whitespace patterns
            pattern_str = escaped.replace(r"\ ", r"\s+")
            # Use word boundaries for more accurate matching
            self.patterns[keyword] = re.compile(pattern_str, re.IGNORECASE)

    def _identify_red_flags(self) -> List[str]:
        return [
            "location tracking",
            "background location",
            "precise location",
            "biometric data",
            "face recognition",
            "face scan",
            "fingerprint",
            "fingerprint scan",
            "genetic data",
            "social security",
            "credit card",
            "microphone access",
            "camera access",
            "third-party sharing",
            "cross-site tracking",
            "sell your data",
            "data brokers",
            "retain data indefinitely",
        ]

    def analyze(self, text: str) -> AnalysisResult:
        if not text or not text.strip():
            return AnalysisResult(
                risk_score=0,
                risk_level=RiskLevel.LOW,
                red_flags=[],
                summary="No text provided for analysis.",
                detected_keywords=[],
                recommendations=[]
            )
        
        # Normalize text BEFORE any processing
        normalized_text = normalize_text(text)
        text_lower = normalized_text.lower()
        
        detected_keywords: Dict[str, int] = {}
        detected_red_flags: List[str] = []
        
        # Match keywords using regex patterns for more flexible matching
        for keyword, weight in self.keywords.items():
            pattern = self.patterns.get(keyword)
            if pattern and pattern.search(text_lower):
                detected_keywords[keyword] = weight
                # Check if this keyword contains any red flag terms
                for red_flag in self.red_flag_keywords:
                    if red_flag in keyword.lower():
                        if red_flag not in detected_red_flags:
                            detected_red_flags.append(red_flag)
                        break

        # Remove duplicate red flags
        detected_red_flags = list(set(detected_red_flags))
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(detected_keywords)
        
        # Determine risk level (must match frontend utils.ts)
        risk_level = self._determine_risk_level(risk_score)
        
        # Generate summary using normalized text
        summary = self._generate_summary(normalized_text, detected_keywords, risk_level)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(detected_red_flags, risk_level)

        return AnalysisResult(
            risk_score=risk_score,
            risk_level=risk_level,
            red_flags=detected_red_flags,
            summary=summary,
            detected_keywords=list(detected_keywords.keys()),
            recommendations=recommendations
        )
    
    def _calculate_risk_score(self, detected_keywords: Dict[str, int]) -> int:
        if not detected_keywords:
            return 0
        
        # Simple formula: score = min(len(found_terms) * 20, 100)
        # This matches the user's requirement
        count = len(detected_keywords)
        base_score = min(count * 20, 100)
        
        # If we have keywords, also consider the average weight for more accuracy
        if detected_keywords:
            avg_weight = sum(detected_keywords.values()) / count
            # Blend the simple formula with weighted average
            final_score = min(int((base_score + avg_weight) / 2), 100)
            return final_score
        
        return base_score
    
    def _determine_risk_level(self, score: int) -> RiskLevel:
        """
        Determine risk level from score.
        Must match frontend utils.ts:
        0-40  → Low
        41-70 → Medium
        71-100 → High
        """
        if score <= 40:
            return RiskLevel.LOW
        elif score <= 70:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.HIGH
    
    def _generate_summary(self, text: str, detected_keywords: Dict[str, int], risk_level: RiskLevel) -> str:
        keyword_count = len(detected_keywords)
        
        level_descriptions = {
            RiskLevel.LOW: "This text contains minimal privacy concerns.",
            RiskLevel.MEDIUM: "This text contains notable privacy concerns that should be reviewed.",
            RiskLevel.HIGH: "This text contains significant privacy risks that require immediate attention."
        }
        
        summary_parts = [
            level_descriptions[risk_level],
            f"Found {keyword_count} privacy-related term{'s' if keyword_count != 1 else ''}.",
        ]
        
        if detected_keywords:
            sorted_keywords = sorted(detected_keywords.items(), key=lambda x: x[1], reverse=True)[:5]
            top_keywords = [kw for kw, _ in sorted_keywords]
            summary_parts.append(f"Top concerns: {', '.join(top_keywords)}.")
        
        return " ".join(summary_parts)
    
    def _generate_recommendations(self, red_flags: List[str], risk_level: RiskLevel) -> List[str]:
        recommendations = []
        
        if risk_level == RiskLevel.HIGH:
            recommendations.append("This policy contains significant privacy risks. Consider using an alternative service if possible.")
            recommendations.append("Do not agree until you fully understand how your data will be used.")
        
        if risk_level == RiskLevel.MEDIUM:
            recommendations.append("Review the specific data collection practices before accepting.")
        
        if any("location" in flag for flag in red_flags):
            recommendations.append("Consider disabling location services when not actively needed.")
        
        if any("biometric" in flag or "face" in flag or "fingerprint" in flag for flag in red_flags):
            recommendations.append("Be cautious with biometric data - it cannot be changed if compromised.")
        
        if any("third-party" in flag or "sharing" in flag or "advertis" in flag for flag in red_flags):
            recommendations.append("Check the privacy policies of third-party partners involved.")
            recommendations.append("Understand how your data may be shared with advertisers.")
        
        if any("sell" in flag or "data brokers" in flag for flag in red_flags):
            recommendations.append("Be aware that your data may be sold to or shared with data brokers.")
        
        if any("retain" in flag or "indefinitely" in flag for flag in red_flags):
            recommendations.append("Data retention policies are unclear - your data may be kept permanently.")
        
        if any("camera" in flag or "microphone" in flag for flag in red_flags):
            recommendations.append("Review app permissions and only grant camera/microphone access when necessary.")
        
        if any("contact" in flag for flag in red_flags):
            recommendations.append("Be aware that contact access can reveal information about your entire network.")
        
        if not recommendations:
            recommendations.append("Continue to monitor privacy practices as policies may change.")
        
        return recommendations[:5]
    
    def get_grade(self, score: int) -> str:
        """
        Get letter grade from risk score.
        Must match frontend utils.ts:
        0-20  → A
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


# Singleton
analyzer = PrivacyAnalyzer()
