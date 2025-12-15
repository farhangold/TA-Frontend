"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import Button from "../components/Button";
import ActionButton from "../components/ActionButton";
import DetailBugModal from "../components/DetailBugModal";
import UploadCsvModal from "../components/UploadCSVModal";
import DeleteConfirmationModal from "../components/DeleteModal";
import { useCurrentUser } from "../lib/auth";
import {
  GET_UAT_REPORTS,
  DELETE_UAT_REPORT,
  UPLOAD_BATCH_REPORTS,
  DELETE_ALL_UAT_REPORTS,
  DELETE_BULK_UAT_REPORTS,
} from "../graphql/uatReports";
import { EVALUATE_BATCH_REPORTS } from "../graphql/evaluations";

const ITEMS_PER_PAGE = 10;

type ReportRow = {
  id: string;
  rawId: string;
  description: string;
  date: string;
  reporter: string;
  status?: string; // Kept for DetailBugModal compatibility, but not displayed in table
};

type FilterState = {
  severityLevel?: string[];
  domain?: string;
  createdBy?: string;
  dateRange?: { from: string; to: string };
};

type SortState = {
  field: "CREATED_AT" | "UPDATED_AT" | "SCORE" | "SEVERITY";
  direction: "ASC" | "DESC";
};

export default function DaftarLaporan() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortState>({
    field: "CREATED_AT",
    direction: "DESC",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(
    new Set()
  );
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<
    "single" | "bulkSelected" | "all"
  >("single");

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [uploadCsvModalOpen, setUploadCsvModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);

  const { user } = useCurrentUser();

  const filterInput = useMemo(() => {
    const filter: {
      severityLevel?: string[];
      domain?: string;
      createdBy?: string;
      dateRange?: { from: string; to: string };
    } = {};
    if (filters.severityLevel && filters.severityLevel.length > 0) {
      filter.severityLevel = filters.severityLevel;
    }
    if (filters.domain) {
      filter.domain = filters.domain;
    }
    if (filters.createdBy) {
      filter.createdBy = filters.createdBy;
    }
    if (filters.dateRange) {
      filter.dateRange = filters.dateRange;
    }
    if (searchTerm) {
      filter.domain = searchTerm;
    }
    return Object.keys(filter).length > 0 ? filter : undefined;
  }, [filters, searchTerm]);

  const { data, loading, error, refetch } = useQuery(GET_UAT_REPORTS, {
    variables: {
      filter: filterInput,
      sort,
      pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
    },
    fetchPolicy: "cache-and-network",
  });

  const [evaluateBatch] = useMutation(EVALUATE_BATCH_REPORTS);
  const [deleteReport] = useMutation(DELETE_UAT_REPORT);
  const [deleteBulkReports] = useMutation(DELETE_BULK_UAT_REPORTS);
  const [deleteAllReports] = useMutation(DELETE_ALL_UAT_REPORTS);
  const [uploadBatch] = useMutation(UPLOAD_BATCH_REPORTS);

  const reports: ReportRow[] = useMemo(() => {
    if (!data?.getUATReports) return [];

    return data.getUATReports.edges.map(
      (edge: {
        node: {
          _id: string;
          testIdentity?: { testId?: string; title?: string };
          actualResult?: string;
          status: string;
          createdAt: string;
          createdBy?: { name?: string; email?: string };
        };
      }) => {
        const node = edge.node;
        const createdAt = new Date(node.createdAt);

        return {
          rawId: node._id,
          id: `#${node.testIdentity?.testId ?? node._id.slice(-6)}`,
          description:
            node.testIdentity?.title ??
            node.actualResult ??
            "Tidak ada deskripsi",
          date: createdAt.toLocaleDateString("id-ID"),
          reporter: node.createdBy?.name ?? node.createdBy?.email ?? "-",
          status: node.status, // Kept for DetailBugModal compatibility
        };
      }
    );
  }, [data]);

  const totalCount = data?.getUATReports?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAction = (
    type: "detailBug" | "uploadCSV" | "delete",
    id: string
  ) => {
    const report = reports.find((item) => item.id === id);
    if (!report) return;

    setSelectedReport(report);

    if (type === "detailBug") {
      // Navigate to detail page instead of opening modal
      router.push(`/detail-laporan?reportId=${report.rawId}`);
    } else if (type === "uploadCSV") {
      setUploadCsvModalOpen(true);
    } else if (type === "delete") {
      setDeleteMode("single");
      setDeleteModalOpen(true);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);

    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalBugReports = 0;
    let totalSuccessReports = 0;
    const fileResults: Array<{
      fileName: string;
      successful: number;
      failed: number;
      errors: Array<{ row: number; message: string }>;
      bugReports: number;
      successReports: number;
    }> = [];

    try {
      // Process each file sequentially
      for (const file of files) {
    try {
          const format = file.name.endsWith(".csv") ? "CSV" : "JSON";

          // Read file content
          const fileContent = await file.text();

          // For JSON files, validate it's valid JSON
          if (format === "JSON") {
            try {
              JSON.parse(fileContent);
            } catch {
              fileResults.push({
                fileName: file.name,
                successful: 0,
                failed: 0,
                errors: [{ row: 0, message: "File JSON tidak valid" }],
                bugReports: 0,
                successReports: 0,
              });
              totalFailed++;
              continue; // Skip to next file
            }
          }

      const result = await uploadBatch({
        variables: {
          input: {
            format,
            data: fileContent,
          },
        },
      });

      if (result.data?.uploadBatchReports) {
            const { successful, failed, errors, reports } =
              result.data.uploadBatchReports;

            // Count report types
            type ReportWithType = { reportType?: string };
            const bugReports =
              reports?.filter(
                (r: ReportWithType) => r.reportType === "BUG_REPORT"
              ).length || 0;
            const successReports =
              reports?.filter(
                (r: ReportWithType) => r.reportType === "SUCCESS_REPORT"
              ).length || 0;

            fileResults.push({
              fileName: file.name,
              successful,
              failed,
              errors: errors || [],
              bugReports,
              successReports,
            });

            totalSuccessful += successful;
            totalFailed += failed;
            totalBugReports += bugReports;
            totalSuccessReports += successReports;
          }
        } catch (fileError: unknown) {
          console.error(`Error uploading file ${file.name}:`, fileError);

          // Extract error message for this file
          let errorMessage = "Gagal mengunggah file";
          if (
            typeof fileError === "object" &&
            fileError !== null &&
            "graphQLErrors" in fileError &&
            Array.isArray(
              (fileError as { graphQLErrors?: unknown[] }).graphQLErrors
            ) &&
            (fileError as { graphQLErrors: unknown[] }).graphQLErrors.length >
              0
          ) {
            const graphQLError = (
              fileError as { graphQLErrors: Array<{ message?: string }> }
            ).graphQLErrors[0];
            if (graphQLError && typeof graphQLError.message === "string") {
              errorMessage = graphQLError.message;
            }
          } else if (
            typeof fileError === "object" &&
            fileError !== null &&
            "message" in fileError &&
            typeof (fileError as { message: unknown }).message === "string"
          ) {
            errorMessage = (fileError as { message: string }).message;
          }

          fileResults.push({
            fileName: file.name,
            successful: 0,
            failed: 0,
            errors: [{ row: 0, message: errorMessage }],
            bugReports: 0,
            successReports: 0,
          });
          totalFailed++;
          // Continue with next file even if this one fails
        }
      }

      // Show comprehensive summary
      let summaryMessage = `Upload Selesai!\n\nTotal: ${totalSuccessful} berhasil, ${totalFailed} gagal dari ${files.length} file(s)`;

      if (totalBugReports > 0 || totalSuccessReports > 0) {
        summaryMessage += `\n\nKlasifikasi Total:\n- ${totalBugReports} Bug Report\n- ${totalSuccessReports} Success Report`;
      }

      // Add per-file breakdown if there are multiple files
      if (files.length > 1) {
        summaryMessage += `\n\nDetail per File:`;
        fileResults.forEach((result) => {
          summaryMessage += `\n\n📄 ${result.fileName}:`;
          summaryMessage += `\n  ✅ ${result.successful} berhasil, ❌ ${result.failed} gagal`;
          if (result.bugReports > 0 || result.successReports > 0) {
            summaryMessage += `\n  🐛 ${result.bugReports} Bug Report, ✅ ${result.successReports} Success Report`;
          }
          if (result.errors.length > 0) {
            summaryMessage += `\n  ⚠️ Error: ${result.errors.map((e) => e.message).join(", ")}`;
          }
        });
      } else if (fileResults.length > 0) {
        // Single file - show errors if any
        const result = fileResults[0];
        if (result.errors.length > 0) {
          summaryMessage += `\n\nError:\n${result.errors
            .map((e) => `Baris ${e.row}: ${e.message}`)
            .join("\n")}`;
        }
      }

      alert(summaryMessage);
      await refetch();
      // Setelah upload selesai, pastikan user melihat data terbaru di halaman pertama
      setCurrentPage(1);
    } catch (e: unknown) {
      console.error("Error in upload process:", e);
      alert("Terjadi kesalahan saat memproses upload. Silakan coba lagi.");
    } finally {
      setUploadCsvModalOpen(false);
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      if (deleteMode === "single") {
        if (!selectedReport) return;

        await deleteReport({
          variables: { id: selectedReport.rawId },
        });
      } else if (deleteMode === "bulkSelected") {
        if (selectedReportIds.size === 0) return;

        await deleteBulkReports({
          variables: { ids: Array.from(selectedReportIds) },
        });
        setSelectedReportIds(new Set());
      } else if (deleteMode === "all") {
        await deleteAllReports();
        setSelectedReportIds(new Set());
        setCurrentPage(1);
      }

      await refetch();
    } catch (e) {
      console.error("Error deleting report(s):", e);
      alert("Gagal menghapus laporan. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDeleteMode("single");
    }
  };

  const handleToggleSelect = (rawId: string) => {
    const newSelected = new Set(selectedReportIds);
    if (newSelected.has(rawId)) {
      newSelected.delete(rawId);
    } else {
      newSelected.add(rawId);
    }
    setSelectedReportIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReportIds.size === reports.length) {
      setSelectedReportIds(new Set());
    } else {
      setSelectedReportIds(new Set(reports.map((r) => r.rawId)));
    }
  };

  const handleBatchEvaluate = async () => {
    if (selectedReportIds.size === 0) return;

    setIsBatchEvaluating(true);
    try {
      await evaluateBatch({
        variables: { ids: Array.from(selectedReportIds) },
      });
      setSelectedReportIds(new Set());
      await refetch();
    } catch (e) {
      console.error("Error batch evaluating reports:", e);
      alert("Gagal melakukan validasi batch. Silakan coba lagi.");
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const getPageNumbers = () => {
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


  return (
    <DashboardLayout title="Daftar Laporan">
      <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Laporan Bug</h2>
          <div className="flex gap-2 items-center">
            {user && (user.role === "ADMIN" || user.role === "REVIEWER") && (
              <Button
                type="button"
                onClick={() => setUploadCsvModalOpen(true)}
                size="md"
                variant="primary"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                Upload File (JSON/CSV)
              </Button>
            )}
            {selectedReportIds.size > 0 && (
              <>
                <Button
                  type="button"
                  onClick={handleBatchEvaluate}
                  disabled={isBatchEvaluating || isDeleting}
                  size="sm"
                  variant="primary"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {isBatchEvaluating
                    ? "Memvalidasi..."
                    : `Validasi Batch (${selectedReportIds.size})`}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setDeleteMode("bulkSelected");
                    setDeleteModalOpen(true);
                  }}
                  disabled={isDeleting}
                  size="sm"
                  variant="ternary"
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {isDeleting ? "Menghapus..." : `Hapus Terpilih (${selectedReportIds.size})`}
                </Button>
              </>
            )}
            {totalCount > 0 && user?.role === "ADMIN" && (
              <Button
                type="button"
                onClick={() => {
                  setDeleteMode("all");
                  setDeleteModalOpen(true);
                }}
                disabled={isDeleting}
                size="sm"
                variant="ternary"
                className="px-4 py-2 bg-gradient-to-r from-red-700 to-black text-white rounded-xl hover:from-red-800 hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              >
                {isDeleting ? "Menghapus semua..." : "Hapus Semua Data"}
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              variant="secondary"
              className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 text-sm font-medium transition-all duration-200"
            >
              Filter
            </Button>
          <div className="relative">
            <input
              type="text"
                placeholder="Cari berdasarkan domain"
              value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl w-64 text-gray-900 placeholder:text-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Severity
                </label>
                <select
                  multiple
                  value={filters.severityLevel || []}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setFilters({ ...filters, severityLevel: values });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  size={3}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Sort By
                </label>
                <select
                  value={sort.field}
                  onChange={(e) =>
                    setSort({
                      ...sort,
                      field: e.target.value as SortState["field"],
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mb-2"
                >
                  <option value="CREATED_AT">Created At</option>
                  <option value="UPDATED_AT">Updated At</option>
                  <option value="SCORE">Score</option>
                  <option value="SEVERITY">Severity</option>
                </select>
                <select
                  value={sort.direction}
                  onChange={(e) =>
                    setSort({
                      ...sort,
                      direction: e.target.value as SortState["direction"],
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Date Range
                </label>
                <input
                  type="date"
                  value={filters.dateRange?.from || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        from: e.target.value,
                        to: filters.dateRange?.to || "",
                      },
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mb-2"
                />
                <input
                  type="date"
                  value={filters.dateRange?.to || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        from: filters.dateRange?.from || "",
                        to: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  setFilters({});
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                size="sm"
                variant="secondary"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

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
                    <th className="py-3 px-4 text-center w-12">
                      <input
                        type="checkbox"
                        checked={
                          reports.length > 0 &&
                          selectedReportIds.size === reports.length
                        }
                        onChange={handleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                <th className="py-3 px-4 text-left w-24">ID</th>
                <th className="py-3 px-4 text-left">Deskripsi Bug</th>
                    <th className="py-3 px-4 text-center w-36">
                      Tanggal Dikirim
                    </th>
                <th className="py-3 px-4 text-center w-32">Crowdworker</th>
                <th className="py-3 px-4 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
                  {reports.map((report, index) => (
                <tr
                      key={report.rawId}
                      className={`border-b border-gray-200 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-blue-50/50 ${
                        selectedReportIds.has(report.rawId) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedReportIds.has(report.rawId)}
                          onChange={() => handleToggleSelect(report.rawId)}
                          className="cursor-pointer"
                        />
                      </td>
                  <td className="py-3 px-4 text-left font-medium">
                    {report.id}
                  </td>
                      <td className="py-3 px-4 text-left">
                        {report.description}
                      </td>
                  <td className="py-3 px-4 text-center">{report.date}</td>
                      <td className="py-3 px-4 text-center">
                        {report.reporter}
                      </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-1">
                      <ActionButton
                        type="detailBug"
                        onClick={() => handleAction("detailBug", report.id)}
                      />
                      <ActionButton
                        type="uploadCSV"
                            onClick={() => handleAction("uploadCSV", report.id)}
                      />
                      <ActionButton
                        type="delete"
                        onClick={() => handleAction("delete", report.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
                  {reports.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-sm text-gray-500"
                      >
                        Tidak ada laporan yang ditemukan.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="text-gray-600">
            Showing{" "}
                {totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                {totalCount} result
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex ml-2">
              <Button
                type="button"
                onClick={() =>
                  handlePageChange(Math.max(1, currentPage - 1))
                }
                disabled={currentPage === 1}
                size="sm"
                  variant="secondary"
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

              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                    size="sm"
                    variant={currentPage === page ? "primary" : "secondary"}
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
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                size="sm"
                  variant="secondary"
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
        </div>
          </>
        )}
      </div>

      <DetailBugModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        data={
          selectedReport
            ? {
                ...selectedReport,
                rawId: selectedReport.rawId,
                status: selectedReport.status || "",
              }
            : {
            id: "",
                rawId: "",
            status: "",
            date: "",
            reporter: "",
            description: "",
          }
        }
        type={
          selectedReport && selectedReport.status === "VALID"
            ? "bug"
            : "non-bug"
        }
      />

      <UploadCsvModal
        isOpen={uploadCsvModalOpen}
        onClose={() => {
          if (!isUploading) {
            setUploadCsvModalOpen(false);
          }
        }}
        onUpload={handleFileUpload}
        isUploading={isUploading}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setDeleteMode("single");
          }
        }}
        onConfirm={handleDeleteConfirm}
        bugId={
          deleteMode === "single" && selectedReport
            ? selectedReport.rawId.slice(-6)
            : undefined
        }
        title={
          deleteMode === "single"
            ? "Anda yakin ingin menghapus Bug ini?"
            : deleteMode === "bulkSelected"
            ? `Anda yakin ingin menghapus ${selectedReportIds.size} laporan terpilih?`
            : "Anda yakin ingin menghapus SEMUA data laporan?"
        }
      />

      {(detailModalOpen || uploadCsvModalOpen || deleteModalOpen) && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 max-w-md mx-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="text-sm font-medium text-gray-700">
              Mengupload laporan... Mohon tunggu hingga proses selesai. Website
              akan aktif kembali setelah upload selesai.
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
