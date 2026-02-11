/**
 * Export report file
 */

export interface ReportData {
  risk_score: number;
  grade: string;
  risk_level: string;
  summary: string;
  detected_keywords: string[];
  recommendations: string[];
  red_flags?: string[];
  original_text?: string;
  analyzed_at?: string;
}

export function exportReportAsTxt(report: ReportData): void {
  const text = `PrivacyGuard Report
------------------------

Score: ${report.risk_score}
Grade: ${report.grade}
Risk Level: ${report.risk_level}

Summary:
${report.summary}

Detected Keywords:
${report.detected_keywords.join(", ")}

Red Flags:
${report.red_flags?.join(", ") || "None"}

Recommendations:
${report.recommendations.join("\n")}

Original Text:
${report.original_text || "N/A"}

Generated: ${report.analyzed_at || new Date().toISOString()}
`;

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `privacyguard-report-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
