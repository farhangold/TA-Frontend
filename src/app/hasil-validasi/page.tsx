"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useLazyQuery } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import ActionButton from "../components/ActionButton";
import ExportButton from "../components/ExportButton";
import { GET_UAT_REPORTS } from "../graphql/uatReports";
import { GET_EVALUATION } from "../graphql/evaluations";
import DetailReportModal from "../components/DetailReportModal";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  formatReportDataForExport,
  generateFilename,
  ExportFormat,
} from "../utils/exportUtils";

const ITEMS_PER_PAGE = 10;

type ReportRow = {
  id: string;
  rawId: string;
  description: string;
  status: string;
  date: string;
  reporter: string;
  score?: number;
  reportType?: string;
};

function HasilValidasiContent() {
  const searchParams = useSearchParams();
  const [validPage, setValidPage] = useState(1);
  const [invalidPage, setInvalidPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<{
    valid: boolean;
    invalid: boolean;
  }>({ valid: false, invalid: false });

  // Check for reportId in URL query params (from redirect)
  useEffect(() => {
    const reportIdFromUrl = searchParams.get("reportId");
    if (reportIdFromUrl) {
      setSelectedReportId(reportIdFromUrl);
      setDetailModalOpen(true);
    }
  }, [searchParams]);

  // Fetch valid reports
  const {
    data: validData,
    loading: validLoading,
    error: validError,
  } = useQuery(GET_UAT_REPORTS, {
    variables: {
      filter: {
        status: ["VALID"],
      },
      sort: {
        field: "CREATED_AT",
        direction: "DESC",
      },
      pagination: { page: validPage, limit: ITEMS_PER_PAGE },
    },
    fetchPolicy: "cache-and-network",
  });

  // Fetch invalid reports
  const {
    data: invalidData,
    loading: invalidLoading,
    error: invalidError,
  } = useQuery(GET_UAT_REPORTS, {
    variables: {
      filter: {
        status: ["INVALID"],
      },
      sort: {
        field: "CREATED_AT",
        direction: "DESC",
      },
      pagination: { page: invalidPage, limit: ITEMS_PER_PAGE },
    },
    fetchPolicy: "cache-and-network",
  });

  // Fetch evaluation for selected report
  const {
    data: evaluationData,
    loading: evaluationLoading,
  } = useQuery(GET_EVALUATION, {
    skip: !selectedReportId,
    variables: { reportId: selectedReportId || "" },
    fetchPolicy: "cache-and-network",
  });

  // Lazy query for fetching all reports for export
  const [fetchAllReports] = useLazyQuery(GET_UAT_REPORTS, {
    fetchPolicy: "network-only",
  });

  const validReports: ReportRow[] = useMemo(() => {
    if (!validData?.getUATReports) return [];

    return validData.getUATReports.edges.map(
      (edge: {
        node: {
          _id: string;
          testIdentity?: { testId?: string; title?: string };
          actualResult?: string;
          status: string;
          createdAt: string;
          createdBy?: { name?: string; email?: string };
          reportType?: string;
        };
      }) => {
        const node = edge.node;
        const createdAt = new Date(node.createdAt);

        return {
          rawId: node._id,
          id: `#${node.testIdentity?.testId ?? node._id.slice(-6)}`,
          description:
            node.testIdentity?.title ?? node.actualResult ?? "Tidak ada deskripsi",
          status: node.status,
          date: createdAt.toLocaleDateString("id-ID"),
          reporter: node.createdBy?.name ?? node.createdBy?.email ?? "-",
          reportType: node.reportType,
        };
      },
    );
  }, [validData]);

  const invalidReports: ReportRow[] = useMemo(() => {
    if (!invalidData?.getUATReports) return [];

    return invalidData.getUATReports.edges.map(
      (edge: {
        node: {
          _id: string;
          testIdentity?: { testId?: string; title?: string };
          actualResult?: string;
          status: string;
          createdAt: string;
          createdBy?: { name?: string; email?: string };
          reportType?: string;
        };
      }) => {
        const node = edge.node;
        const createdAt = new Date(node.createdAt);

        return {
          rawId: node._id,
          id: `#${node.testIdentity?.testId ?? node._id.slice(-6)}`,
          description:
            node.testIdentity?.title ?? node.actualResult ?? "Tidak ada deskripsi",
          status: node.status,
          date: createdAt.toLocaleDateString("id-ID"),
          reporter: node.createdBy?.name ?? node.createdBy?.email ?? "-",
          reportType: node.reportType,
        };
      },
    );
  }, [invalidData]);

  const validTotalCount = validData?.getUATReports?.totalCount ?? 0;
  const invalidTotalCount = invalidData?.getUATReports?.totalCount ?? 0;
  const validTotalPages = Math.max(1, Math.ceil(validTotalCount / ITEMS_PER_PAGE));
  const invalidTotalPages = Math.max(1, Math.ceil(invalidTotalCount / ITEMS_PER_PAGE));

  const handleViewDetail = (rawId: string) => {
    setSelectedReportId(rawId);
    setDetailModalOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "VALID") return "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md";
    if (status === "INVALID" || status === "FAILED")
      return "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md";
    return "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md animate-pulse";
  };

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pageNumbers: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Fetch all reports for export (without pagination)
  const fetchAllReportsForExport = async (status: "VALID" | "INVALID") => {
    try {
      const result = await fetchAllReports({
        variables: {
          filter: {
            status: [status],
          },
          sort: {
            field: "CREATED_AT",
            direction: "DESC",
          },
          pagination: { page: 1, limit: 10000 }, // Large limit to get all
        },
      });

      if (result.data?.getUATReports) {
        return result.data.getUATReports.edges.map((edge: { node: unknown }) => edge.node);
      }
      return [];
    } catch (error) {
      console.error("Error fetching reports for export:", error);
      throw error;
    }
  };

  // Export handlers
  const handleExportValid = async (format: ExportFormat) => {
    setExportLoading({ ...exportLoading, valid: true });
    try {
      // Fetch all valid reports
      const allReports = await fetchAllReportsForExport("VALID");
      
      if (allReports.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      // Format data for export
      const exportData = formatReportDataForExport(allReports);
      const filename = generateFilename("laporan-valid", format);

      // Export based on format
      switch (format) {
        case "CSV":
          exportToCSV(exportData, filename);
          break;
        case "EXCEL":
          exportToExcel(exportData, filename);
          break;
        case "PDF":
          exportToPDF(exportData, filename, "Laporan Valid");
          break;
      }

      alert(`Berhasil mengekspor ${allReports.length} laporan valid ke format ${format}`);
    } catch (error) {
      console.error("Error exporting valid reports:", error);
      alert("Gagal mengekspor laporan. Silakan coba lagi.");
    } finally {
      setExportLoading({ ...exportLoading, valid: false });
    }
  };

  const handleExportInvalid = async (format: ExportFormat) => {
    setExportLoading({ ...exportLoading, invalid: true });
    try {
      // Fetch all invalid reports
      const allReports = await fetchAllReportsForExport("INVALID");
      
      if (allReports.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      // Format data for export
      const exportData = formatReportDataForExport(allReports);
      const filename = generateFilename("laporan-invalid", format);

      // Export based on format
      switch (format) {
        case "CSV":
          exportToCSV(exportData, filename);
          break;
        case "EXCEL":
          exportToExcel(exportData, filename);
          break;
        case "PDF":
          exportToPDF(exportData, filename, "Laporan Invalid");
          break;
      }

      alert(`Berhasil mengekspor ${allReports.length} laporan invalid ke format ${format}`);
    } catch (error) {
      console.error("Error exporting invalid reports:", error);
      alert("Gagal mengekspor laporan. Silakan coba lagi.");
    } finally {
      setExportLoading({ ...exportLoading, invalid: false });
    }
  };

  const renderTable = (
    reports: ReportRow[],
    loading: boolean,
    error: Error | null | undefined,
    currentPage: number,
    totalPages: number,
    totalCount: number,
    onPageChange: (page: number) => void,
    title: string,
    badgeColor: string
  ) => (
    <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badgeColor}`}>
            Total: {totalCount}
          </span>
          {title.includes("Valid") ? (
            <ExportButton
              reports={reports}
              reportType="valid"
              loading={exportLoading.valid}
              onExport={handleExportValid}
              disabled={totalCount === 0}
            />
          ) : (
            <ExportButton
              reports={reports}
              reportType="invalid"
              loading={exportLoading.invalid}
              onExport={handleExportInvalid}
              disabled={totalCount === 0}
            />
          )}
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-600">Memuat laporan...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="py-8 text-center text-sm text-red-600">
          Gagal memuat data laporan.
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-semibold leading-normal">
                  <th className="py-3 px-4 text-left w-24">ID</th>
                  <th className="py-3 px-4 text-left">Deskripsi</th>
                  <th className="py-3 px-4 text-center w-28">Status</th>
                  <th className="py-3 px-4 text-center w-36">Tanggal</th>
                  <th className="py-3 px-4 text-center w-32">Pelapor</th>
                  <th className="py-3 px-4 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      Tidak ada laporan ditemukan.
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <tr
                      key={report.rawId}
                      className={`border-b border-gray-200 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-blue-50/50`}
                    >
                      <td className="py-3 px-4 text-left font-medium">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 text-left">
                        {report.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{report.date}</td>
                      <td className="py-3 px-4 text-center">
                        {report.reporter}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ActionButton
                          type="detailBug"
                          onClick={() => handleViewDetail(report.rawId)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Menampilkan {reports.length} dari {totalCount} laporan
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Previous page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {getPageNumbers(currentPage, totalPages).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-8 md:flex justify-center items-center hidden px-3 py-1 mx-1 rounded-xl transition-all duration-200 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Next page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Hasil Validasi">
      {renderTable(
        validReports,
        validLoading,
        validError,
        validPage,
        validTotalPages,
        validTotalCount,
        setValidPage,
        "Laporan Valid",
        "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
      )}

      {renderTable(
        invalidReports,
        invalidLoading,
        invalidError,
        invalidPage,
        invalidTotalPages,
        invalidTotalCount,
        setInvalidPage,
        "Laporan Invalid/Reject",
        "bg-gradient-to-r from-red-400 to-rose-500 text-white"
      )}

      <DetailReportModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReportId(null);
        }}
        evaluation={evaluationData?.getEvaluation}
        loading={evaluationLoading}
      />
    </DashboardLayout>
  );
}

export default function HasilValidasi() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Hasil Validasi">
          <div className="py-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-600">
                Memuat halaman...
              </span>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <HasilValidasiContent />
    </Suspense>
  );
}

