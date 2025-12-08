import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export type ExportFormat = "CSV" | "EXCEL" | "PDF";

export type ExportReportData = {
  reportId: string;
  testId: string;
  title: string;
  version: string;
  reportType: string;
  status: string;
  os: string;
  browser: string;
  device: string;
  actualResult: string;
  stepsToReproduce: string;
  expectedResult: string;
  supportingEvidence: string;
  severityLevel: string;
  domain: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Evaluation fields (optional)
  totalScore?: number;
  scorePercentage?: number;
  validationStatus?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
};

type ReportInput = {
  _id: string;
  testIdentity?: {
    testId?: string;
    title?: string;
    version?: string;
  };
  testEnvironment?: {
    os?: string;
    browser?: string;
    device?: string;
  };
  stepsToReproduce?: string[] | string;
  actualResult?: string;
  expectedResult?: string;
  supportingEvidence?: Array<{ url?: string; [key: string]: unknown }> | string;
  severityLevel?: string;
  domain?: string;
  status?: string;
  reportType?: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type EvaluationInput = {
  reportId: string;
  totalScore?: number;
  scorePercentage?: number;
  validationStatus?: string;
  evaluatedAt?: string;
  evaluatedBy?: {
    name?: string;
    email?: string;
  };
};

/**
 * Format report data for export from GraphQL response
 */
export function formatReportDataForExport(
  reports: ReportInput[],
  evaluations?: EvaluationInput[]
): ExportReportData[] {
  const evaluationMap = new Map<string, EvaluationInput>();
  if (evaluations) {
    evaluations.forEach((evaluation) => {
      if (evaluation.reportId) {
        evaluationMap.set(evaluation.reportId, evaluation);
      }
    });
  }

  return reports.map((report) => {
    const evaluation = evaluationMap.get(report._id);
    const stepsToReproduce = Array.isArray(report.stepsToReproduce)
      ? report.stepsToReproduce.join("; ")
      : report.stepsToReproduce || "";

    const supportingEvidence = Array.isArray(report.supportingEvidence)
      ? report.supportingEvidence
          .map((e: { url?: string; [key: string]: unknown }) => e.url || String(e))
          .filter(Boolean)
          .join("; ")
      : "";

    return {
      reportId: report._id,
      testId: report.testIdentity?.testId || "",
      title: report.testIdentity?.title || "",
      version: report.testIdentity?.version || "",
      reportType: report.reportType || "",
      status: report.status || "",
      os: report.testEnvironment?.os || "",
      browser: report.testEnvironment?.browser || "",
      device: report.testEnvironment?.device || "",
      actualResult: report.actualResult || "",
      stepsToReproduce,
      expectedResult: report.expectedResult || "",
      supportingEvidence,
      severityLevel: report.severityLevel || "",
      domain: report.domain || "",
      createdBy: report.createdBy?.name || report.createdBy?.email || "",
      createdAt: report.createdAt
        ? new Date(report.createdAt).toLocaleString("id-ID")
        : "",
      updatedAt: report.updatedAt
        ? new Date(report.updatedAt).toLocaleString("id-ID")
        : "",
      totalScore: evaluation?.totalScore,
      scorePercentage: evaluation?.scorePercentage,
      validationStatus: evaluation?.validationStatus,
      evaluatedAt: evaluation?.evaluatedAt
        ? new Date(evaluation.evaluatedAt).toLocaleString("id-ID")
        : "",
      evaluatedBy: evaluation?.evaluatedBy?.name || evaluation?.evaluatedBy?.email || "",
    };
  });
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Convert array to CSV string
 */
function arrayToCSV(data: ExportReportData[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add BOM for Excel compatibility
  csvRows.push("\uFEFF");

  // Add headers
  csvRows.push(headers.map(escapeCSV).join(","));

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = (row as Record<string, unknown>)[header];
      return escapeCSV(value !== null && value !== undefined ? String(value) : "");
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportReportData[], filename: string): void {
  const csv = arrayToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel format
 */
export function exportToExcel(data: ExportReportData[], filename: string): void {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const maxWidth = 50;
  const wscols = Object.keys(data[0] || {}).map(() => ({
    wch: maxWidth,
  }));
  ws["!cols"] = wscols;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to PDF format
 */
export function exportToPDF(
  data: ExportReportData[],
  filename: string,
  title: string
): void {
  const doc = new jsPDF("landscape", "mm", "a4");

  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(
    `Diekspor pada: ${new Date().toLocaleString("id-ID")}`,
    14,
    22
  );
  doc.text(`Total: ${data.length} laporan`, 14, 27);

  // Prepare table data
  const tableData = data.map((row) => [
    row.testId || row.reportId.slice(-6),
    row.title || "-",
    row.reportType || "-",
    row.status || "-",
    row.createdAt || "-",
    row.createdBy || "-",
    row.scorePercentage !== undefined
      ? `${row.scorePercentage.toFixed(1)}%`
      : "-",
  ]);

  // Add table using jsPDF autoTable plugin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    head: [
      [
        "Test ID",
        "Title",
        "Type",
        "Status",
        "Created At",
        "Created By",
        "Score",
      ],
    ],
    body: tableData,
    startY: 32,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 32, right: 14, bottom: 14, left: 14 },
    tableWidth: "wrap",
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "-");
  return `${prefix}-${dateStr}`;
}

