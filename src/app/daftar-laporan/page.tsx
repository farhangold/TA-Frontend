"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import ActionButton from "../components/ActionButton";
import DetailBugModal from "../components/DetailBugModal";
import UploadCsvModal from "../components/UploadCSVModal";
import ValidationModal from "../components/ValidationModal";
import DeleteConfirmationModal from "../components/DeleteModal";
import CreateReportModal from "../components/CreateReportModal";
import { useCurrentUser } from "../lib/auth";
import {
  GET_UAT_REPORTS,
  DELETE_UAT_REPORT,
  UPLOAD_BATCH_REPORTS,
  CREATE_UAT_REPORT,
} from "../graphql/uatReports";
import {
  EVALUATE_REPORT,
  EVALUATE_BATCH_REPORTS,
} from "../graphql/evaluations";

const ITEMS_PER_PAGE = 10;

type ReportRow = {
  id: string;
  rawId: string;
  description: string;
  status: string;
  date: string;
  reporter: string;
};

type FilterState = {
  status?: string[];
  severityLevel?: string[];
  domain?: string;
  createdBy?: string;
  dateRange?: { from: string; to: string };
};

type SortState = {
  field: "CREATED_AT" | "UPDATED_AT" | "SCORE" | "SEVERITY" | "STATUS";
  direction: "ASC" | "DESC";
};

export default function DaftarLaporan() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortState>({
    field: "CREATED_AT",
    direction: "DESC",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(
    new Set(),
  );
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [uploadCsvModalOpen, setUploadCsvModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);

  const { user } = useCurrentUser();

  const filterInput = useMemo(() => {
    const filter: {
      status?: string[];
      severityLevel?: string[];
      domain?: string;
      createdBy?: string;
      dateRange?: { from: string; to: string };
    } = {};
    if (filters.status && filters.status.length > 0) {
      filter.status = filters.status;
    }
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

  const [evaluateReport] = useMutation(EVALUATE_REPORT);
  const [evaluateBatch] = useMutation(EVALUATE_BATCH_REPORTS);
  const [deleteReport] = useMutation(DELETE_UAT_REPORT);
  const [uploadBatch] = useMutation(UPLOAD_BATCH_REPORTS);
  const [createReport, { loading: isCreating }] = useMutation(CREATE_UAT_REPORT);

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
            node.testIdentity?.title ?? node.actualResult ?? "Tidak ada deskripsi",
          status: node.status,
          date: createdAt.toLocaleDateString("id-ID"),
          reporter: node.createdBy?.name ?? node.createdBy?.email ?? "-",
        };
      },
    );
  }, [data]);

  const totalCount = data?.getUATReports?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAction = (
    type: "detailBug" | "validation" | "uploadCSV" | "delete",
    id: string,
  ) => {
    const report = reports.find((item) => item.id === id);
    if (!report) return;

    setSelectedReport(report);

    if (type === "detailBug") {
      setDetailModalOpen(true);
    } else if (type === "validation") {
      setValidationModalOpen(true);
    } else if (type === "uploadCSV") {
      setUploadCsvModalOpen(true);
    } else if (type === "delete") {
      setDeleteModalOpen(true);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleValidate = async (_isValid: boolean) => {
    if (!selectedReport) return;

    try {
      await evaluateReport({
        variables: { id: selectedReport.rawId },
      });
      // Backend determines validation status; refetch list for updated status
      await refetch();
    } catch (e) {
      console.error("Error evaluating report:", e);
    } finally {
      setValidationModalOpen(false);
    }
  };

  const handleCreateReport = async (input: any) => {
    try {
      await createReport({
        variables: { input },
        refetchQueries: [
          {
            query: GET_UAT_REPORTS,
            variables: {
              filter: filterInput,
              sort,
              pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
            },
          },
        ],
      });
      setCreateModalOpen(false);
      alert("Laporan berhasil dibuat!");
    } catch (error: any) {
      console.error("Error creating report:", error);
      throw error; // Re-throw to let modal handle error display
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fileContent = await file.text();
      const format = file.name.endsWith(".csv") ? "CSV" : "JSON";

      const result = await uploadBatch({
        variables: {
          input: {
            format,
            data: fileContent,
          },
        },
      });

      if (result.data?.uploadBatchReports) {
        const { successful, failed, errors } = result.data.uploadBatchReports;
        // Show success message
        const errorMessages =
          errors.length > 0
            ? `\n\nError:\n${errors
                .map(
                  (e: { row: number; message: string }) =>
                    `Baris ${e.row}: ${e.message}`,
                )
                .join("\n")}`
            : "";
        alert(
          `Upload selesai: ${successful} berhasil, ${failed} gagal.${errorMessages}`,
        );
        await refetch();
      }
    } catch (e) {
      console.error("Error uploading batch:", e);
      alert("Gagal mengunggah file. Silakan coba lagi.");
    } finally {
      setUploadCsvModalOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReport) return;

    try {
      await deleteReport({
        variables: { id: selectedReport.rawId },
      });
      await refetch();
    } catch (e) {
      console.error("Error deleting report:", e);
    } finally {
      setDeleteModalOpen(false);
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

  const getStatusBadgeClass = (status: string) => {
    if (status === "VALID") return "bg-blue-300 text-blue-800";
    if (status === "INVALID" || status === "FAILED")
      return "bg-red-300 text-red-800";
    return "bg-yellow-200 text-yellow-800";
  };

  return (
    <DashboardLayout title="Daftar Laporan">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Laporan Bug</h2>
          <div className="flex gap-2 items-center">
            {selectedReportIds.size > 0 && (
              <button
                onClick={handleBatchEvaluate}
                disabled={isBatchEvaluating}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isBatchEvaluating
                  ? "Memvalidasi..."
                  : `Validasi Batch (${selectedReportIds.size})`}
              </button>
            )}
            {user && (user.role === "ADMIN" || user.role === "REVIEWER") && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                + Tambah Laporan
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Filter
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan domain"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Status
                </label>
                <select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    setFilters({ ...filters, status: values });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                  size={3}
                >
                  <option value="PENDING_EVALUATION">Pending Evaluation</option>
                  <option value="EVALUATING">Evaluating</option>
                  <option value="VALID">Valid</option>
                  <option value="INVALID">Invalid</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
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
                      (option) => option.value,
                    );
                    setFilters({ ...filters, severityLevel: values });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white mb-2"
                >
                  <option value="CREATED_AT">Created At</option>
                  <option value="UPDATED_AT">Updated At</option>
                  <option value="SCORE">Score</option>
                  <option value="SEVERITY">Severity</option>
                  <option value="STATUS">Status</option>
                </select>
                <select
                  value={sort.direction}
                  onChange={(e) =>
                    setSort({
                      ...sort,
                      direction: e.target.value as SortState["direction"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 mb-2"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-8 text-center text-sm text-gray-500">
            Memuat laporan...
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
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
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
                    <th className="py-3 px-4 text-center w-28">Status</th>
                    <th className="py-3 px-4 text-center w-36">
                      Tanggal Dikirim
                    </th>
                    <th className="py-3 px-4 text-center w-32">Crowdworker</th>
                    <th className="py-3 px-4 text-center w-32">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {reports.map((report) => (
                    <tr
                      key={report.rawId}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
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
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            report.status,
                          )}`}
                        >
                          {report.status}
                        </span>
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
                            type="validation"
                            onClick={() =>
                              handleAction("validation", report.id)
                            }
                          />
                          <ActionButton
                            type="uploadCSV"
                            onClick={() =>
                              handleAction("uploadCSV", report.id)
                            }
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
                        colSpan={7}
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
                {totalCount === 0
                  ? 0
                  : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                {totalCount} result
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex ml-2">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 md:flex justify-center items-center hidden px-3 py-1 mx-1 rounded ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </>
        )}
      </div>

      <DetailBugModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        data={
          selectedReport ?? {
            id: "",
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

      <ValidationModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        data={
          selectedReport ?? {
            id: "",
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
        onValidate={handleValidate}
      />

      <UploadCsvModal
        isOpen={uploadCsvModalOpen}
        onClose={() => setUploadCsvModalOpen(false)}
        onUpload={handleFileUpload}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        bugId={selectedReport?.rawId.slice(-6) ?? ""}
      />

      <CreateReportModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateReport}
        loading={isCreating}
      />

      {(detailModalOpen ||
        validationModalOpen ||
        uploadCsvModalOpen ||
        deleteModalOpen ||
        createModalOpen) && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
    </DashboardLayout>
  );
}
