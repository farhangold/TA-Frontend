"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import ActionButton from "../components/ActionButton";
import ExportButton from "../components/ExportButton";
import Button from "../components/Button";
import { GET_UAT_REPORTS } from "../graphql/uatReports";
import {
  GET_EVALUATION,
  DELETE_EVALUATION_BY_REPORT,
} from "../graphql/evaluations";
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
  completenessStatus?: string;
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
  const [evaluationsCache, setEvaluationsCache] = useState<
    Record<string, { completenessStatus?: string }>
  >({});
  const [deleteTargetReportId, setDeleteTargetReportId] = useState<
    string | null
  >(null);
  const [selectedValidIds, setSelectedValidIds] = useState<string[]>([]);
  const [selectedInvalidIds, setSelectedInvalidIds] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

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
    refetch: refetchValid,
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
    refetch: refetchInvalid,
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
    error: evaluationError,
  } = useQuery(GET_EVALUATION, {
    skip: !selectedReportId,
    variables: { reportId: selectedReportId || "" },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  // Lazy query for fetching evaluations for reports in table
  const [getEvaluation] = useLazyQuery(GET_EVALUATION, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  // Lazy query for fetching all reports for export
  const [fetchAllReports] = useLazyQuery(GET_UAT_REPORTS, {
    fetchPolicy: "network-only",
  });

  const [deleteEvaluationMutation, { loading: deleteEvaluationLoading }] =
    useMutation(DELETE_EVALUATION_BY_REPORT, {
      onError: (error) => {
        console.error("Error deleting evaluation:", error);
        alert("Gagal menghapus hasil validasi. Silakan coba lagi.");
      },
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
        const evaluation = evaluationsCache[node._id];

        return {
          rawId: node._id,
          id: `#${node.testIdentity?.testId ?? node._id.slice(-6)}`,
          description:
            node.testIdentity?.title ??
            node.actualResult ??
            "Tidak ada deskripsi",
          status: node.status,
          date: createdAt.toLocaleDateString("id-ID"),
          reporter: node.createdBy?.name ?? node.createdBy?.email ?? "-",
          reportType: node.reportType,
          completenessStatus: evaluation?.completenessStatus,
        };
      }
    );
  }, [validData, evaluationsCache]);

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
        const evaluation = evaluationsCache[node._id];

        return {
          rawId: node._id,
          id: `#${node.testIdentity?.testId ?? node._id.slice(-6)}`,
          description:
            node.testIdentity?.title ??
            node.actualResult ??
            "Tidak ada deskripsi",
          status: node.status,
          date: createdAt.toLocaleDateString("id-ID"),
          reporter: node.createdBy?.name ?? node.createdBy?.email ?? "-",
          reportType: node.reportType,
          completenessStatus: evaluation?.completenessStatus,
        };
      }
    );
  }, [invalidData, evaluationsCache]);

  const validTotalCount = validData?.getUATReports?.totalCount ?? 0;
  const invalidTotalCount = invalidData?.getUATReports?.totalCount ?? 0;
  const validTotalPages = Math.max(
    1,
    Math.ceil(validTotalCount / ITEMS_PER_PAGE)
  );
  const invalidTotalPages = Math.max(
    1,
    Math.ceil(invalidTotalCount / ITEMS_PER_PAGE)
  );

  // Fetch evaluations for all reports in table
  useEffect(() => {
    const allReportIds = [
      ...(validData?.getUATReports?.edges?.map(
        (e: { node: { _id: string } }) => e.node._id
      ) || []),
      ...(invalidData?.getUATReports?.edges?.map(
        (e: { node: { _id: string } }) => e.node._id
      ) || []),
    ];

    const reportIdsToFetch = allReportIds.filter(
      (reportId: string) => !evaluationsCache[reportId]
    );

    if (reportIdsToFetch.length === 0) return;

    reportIdsToFetch.forEach((reportId: string) => {
      getEvaluation({
        variables: { reportId },
      })
        .then((result) => {
          if (result.data?.getEvaluation) {
            setEvaluationsCache((prev) => ({
              ...prev,
              [reportId]: {
                completenessStatus:
                  result.data.getEvaluation.completenessStatus,
              },
            }));
          }
        })
        .catch(() => {
          // Ignore errors, evaluation might not exist
          setEvaluationsCache((prev) => ({
            ...prev,
            [reportId]: {},
          }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validData?.getUATReports?.edges, invalidData?.getUATReports?.edges]);

  const handleViewDetail = (rawId: string) => {
    setSelectedReportId(rawId);
    setDetailModalOpen(true);
  };

  const removeEvaluationFromCache = (reportId: string) => {
    setEvaluationsCache((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [reportId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleDeleteEvaluation = async (reportId: string) => {
    if (!reportId) return;

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus hasil validasi untuk laporan ini?\n\nTindakan ini hanya menghapus hasil evaluasi (skor & feedback), laporan aslinya tetap tersimpan."
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeleteTargetReportId(reportId);
      const result = await deleteEvaluationMutation({
        variables: { reportId },
      });

      if (result.data?.deleteEvaluationByReport) {
        alert("Hasil validasi berhasil dihapus.");

        // Hapus cache evaluasi untuk laporan ini
        removeEvaluationFromCache(reportId);

        // Tutup modal detail jika sedang melihat laporan yang sama
        if (selectedReportId === reportId) {
          setDetailModalOpen(false);
          setSelectedReportId(null);
        }
      } else {
        alert("Gagal menghapus hasil validasi. Silakan coba lagi.");
      }
    } catch {
      // onError handler pada mutation sudah menampilkan alert
    } finally {
      setDeleteTargetReportId(null);
    }
  };

  const handleToggleSelect = (
    reportId: string,
    selectedIds: string[],
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleToggleSelectAll = (
    reports: ReportRow[],
    selectedIds: string[],
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const allIds = reports.map((r) => r.rawId);
    const isAllSelected =
      allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      // Hapus hanya ID yang ada di halaman ini dari seleksi
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      // Tambahkan semua ID di halaman ini ke seleksi
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const performBulkDelete = async (
    reportIds: string[],
    label: string,
    clearSelection: () => void
  ) => {
    if (reportIds.length === 0) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus hasil validasi untuk ${reportIds.length} laporan pada daftar ${label}?\n\nTindakan ini hanya menghapus hasil evaluasi (skor & feedback), laporan aslinya tetap tersimpan.`
    );
    if (!confirmed) return;

    try {
      setBulkDeleteLoading(true);
      let successCount = 0;

      for (const reportId of reportIds) {
        try {
          const result = await deleteEvaluationMutation({
            variables: { reportId },
          });

          if (result.data?.deleteEvaluationByReport) {
            successCount += 1;
            removeEvaluationFromCache(reportId);

            if (selectedReportId === reportId) {
              setDetailModalOpen(false);
              setSelectedReportId(null);
            }
          }
        } catch {
          // error per-item sudah ditangani onError; lanjut ke item berikutnya
        }
      }

      if (successCount > 0) {
        alert(
          `Berhasil menghapus hasil validasi untuk ${successCount} laporan pada daftar ${label}.`
        );
        clearSelection();
      } else {
        alert("Gagal menghapus hasil validasi. Silakan coba lagi.");
      }
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "VALID")
      return "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md";
    if (status === "INVALID" || status === "FAILED")
      return "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md";
    return "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md animate-pulse";
  };

  const getCompletenessBadgeClass = (status?: string) => {
    if (!status) return "bg-gray-200 text-gray-600";
    if (status === "COMPLETE")
      return "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md";
    return "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md";
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
        return result.data.getUATReports.edges.map(
          (edge: { node: unknown }) => edge.node
        );
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
      const filename = generateFilename("laporan-valid");

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

      alert(
        `Berhasil mengekspor ${allReports.length} laporan valid ke format ${format}`
      );
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
      const filename = generateFilename("laporan-invalid");

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

      alert(
        `Berhasil mengekspor ${allReports.length} laporan invalid ke format ${format}`
      );
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
    badgeColor: string,
    onRefresh?: () => void,
    selectedIds: string[] = [],
    onToggleOne?: (rawId: string) => void,
    onToggleAll?: () => void,
    onBulkDelete?: () => void,
    onDeleteAll?: () => void,
    isBulkDeleting?: boolean
  ) => (
    <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${badgeColor}`}
          >
            Total: {totalCount}
          </span>
          {onRefresh && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className="px-3 py-1 rounded-xl border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Refresh
            </Button>
          )}
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
          <div className="flex items-center gap-2 ml-2">
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={onBulkDelete}
              disabled={
                !onBulkDelete ||
                selectedIds.length === 0 ||
                loading ||
                !!isBulkDeleting
              }
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                selectedIds.length === 0 || loading || isBulkDeleting
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              }`}
            >
              Hapus Terpilih
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={onDeleteAll}
              disabled={
                !onDeleteAll ||
                reports.length === 0 ||
                loading ||
                !!isBulkDeleting
              }
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                reports.length === 0 || loading || isBulkDeleting
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
              }`}
            >
              Hapus Semua (Halaman)
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-600">
              Memuat laporan...
            </span>
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
                  <th className="py-3 px-4 text-center w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={
                        reports.length > 0 &&
                        reports.every((r) => selectedIds.includes(r.rawId))
                      }
                      onChange={() => onToggleAll && onToggleAll()}
                    />
                  </th>
                  <th className="py-3 px-4 text-left w-24">ID</th>
                  <th className="py-3 px-4 text-left">Deskripsi</th>
                  <th className="py-3 px-4 text-center w-28">Status</th>
                  <th className="py-3 px-4 text-center w-32">Completeness</th>
                  <th className="py-3 px-4 text-center w-36">Tanggal</th>
                  <th className="py-3 px-4 text-center w-32">Pelapor</th>
                  <th className="py-3 px-4 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
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
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedIds.includes(report.rawId)}
                          onChange={() =>
                            onToggleOne && onToggleOne(report.rawId)
                          }
                        />
                      </td>
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
                      <td className="py-3 px-4 text-center">
                        {report.completenessStatus ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getCompletenessBadgeClass(
                              report.completenessStatus
                            )}`}
                          >
                            {report.completenessStatus === "COMPLETE"
                              ? "✓ Complete"
                              : "⚠ Incomplete"}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
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
                <Button
                  type="button"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
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
                </Button>

                {getPageNumbers(currentPage, totalPages).map((page) => (
                  <Button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    size="sm"
                    variant={currentPage === page ? "primary" : "outline"}
                    className={`w-8 md:flex justify-center items-center hidden px-3 py-1 mx-1 rounded-xl transition-all duration-200 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  type="button"
                  onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
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
                </Button>
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
        "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
        () => {
          refetchValid();
          setEvaluationsCache({});
        },
        selectedValidIds,
        (rawId: string) =>
          handleToggleSelect(rawId, selectedValidIds, setSelectedValidIds),
        () =>
          handleToggleSelectAll(
            validReports,
            selectedValidIds,
            setSelectedValidIds
          ),
        () =>
          performBulkDelete(
            selectedValidIds,
            "Laporan Valid",
            () => setSelectedValidIds([])
          ),
        () =>
          performBulkDelete(
            validReports.map((r) => r.rawId),
            "Laporan Valid",
            () => setSelectedValidIds([])
          ),
        bulkDeleteLoading
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
        "bg-gradient-to-r from-red-400 to-rose-500 text-white",
        () => {
          refetchInvalid();
          setEvaluationsCache({});
        },
        selectedInvalidIds,
        (rawId: string) =>
          handleToggleSelect(rawId, selectedInvalidIds, setSelectedInvalidIds),
        () =>
          handleToggleSelectAll(
            invalidReports,
            selectedInvalidIds,
            setSelectedInvalidIds
          ),
        () =>
          performBulkDelete(
            selectedInvalidIds,
            "Laporan Invalid/Reject",
            () => setSelectedInvalidIds([])
          ),
        () =>
          performBulkDelete(
            invalidReports.map((r) => r.rawId),
            "Laporan Invalid/Reject",
            () => setSelectedInvalidIds([])
          ),
        bulkDeleteLoading
      )}

      <DetailReportModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReportId(null);
        }}
        evaluation={evaluationData?.getEvaluation}
        loading={evaluationLoading}
        error={evaluationError}
        onDeleteEvaluation={handleDeleteEvaluation}
        deleteLoading={deleteEvaluationLoading && !!deleteTargetReportId}
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
