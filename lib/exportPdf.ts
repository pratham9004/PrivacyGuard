/**
 * PDF export utility using jsPDF
 */

import jsPDF from "jspdf";

export interface ReportPdfData {
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

export function exportReportAsPdf(report: ReportPdfData): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;
  const leftMargin = 15;
  const maxLineWidth = pageWidth - leftMargin - 15;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, y: number, fontSize: number = 10): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxLineWidth);
    let currentY = y;
    
    lines.forEach((line: string) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
      pdf.text(line, leftMargin, currentY);
      currentY += fontSize * 0.4;
    });
    
    return currentY;
  };

  // Title
  pdf.setFontSize(18);
  pdf.setTextColor(0, 128, 0); // Green color
  pdf.text("PrivacyGuard Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Reset color
  pdf.setTextColor(0, 0, 0);

  // Score, Grade, Risk Level
  pdf.setFontSize(12);
  pdf.setFont(undefined, "bold");
  pdf.text(`Score: ${report.risk_score}`, leftMargin, yPosition);
  yPosition += 8;
  
  pdf.text(`Grade: ${report.grade}`, leftMargin, yPosition);
  yPosition += 8;
  
  pdf.text(`Risk Level: ${report.risk_level}`, leftMargin, yPosition);
  yPosition += 12;

  // Summary
  pdf.setFont(undefined, "bold");
  pdf.setFontSize(12);
  yPosition = addWrappedText("Summary:", yPosition, 12);
  pdf.setFont(undefined, "normal");
  yPosition = addWrappedText(report.summary, yPosition, 10);
  yPosition += 5;

  // Detected Keywords
  pdf.setFont(undefined, "bold");
  yPosition = addWrappedText("Detected Keywords:", yPosition, 12);
  pdf.setFont(undefined, "normal");
  const keywordsText = report.detected_keywords.join(", ");
  yPosition = addWrappedText(keywordsText || "None", yPosition, 10);
  yPosition += 5;

  // Red Flags
  if (report.red_flags && report.red_flags.length > 0) {
    pdf.setFont(undefined, "bold");
    yPosition = addWrappedText("Red Flags:", yPosition, 12);
    pdf.setFont(undefined, "normal");
    const redFlagsText = report.red_flags.join(", ");
    yPosition = addWrappedText(redFlagsText, yPosition, 10);
    yPosition += 5;
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    pdf.setFont(undefined, "bold");
    yPosition = addWrappedText("Recommendations:", yPosition, 12);
    pdf.setFont(undefined, "normal");
    
    report.recommendations.forEach((rec: string, index: number) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      const recLines = pdf.splitTextToSize(`${index + 1}. ${rec}`, maxLineWidth);
      recLines.forEach((line: string) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, leftMargin, yPosition);
        yPosition += 5;
      });
    });
  }

  // Timestamp
  yPosition += 5;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    `Generated: ${report.analyzed_at || new Date().toISOString()}`,
    leftMargin,
    yPosition
  );

  // Save the PDF
  pdf.save(`privacyguard-report-${Date.now()}.pdf`);
}
