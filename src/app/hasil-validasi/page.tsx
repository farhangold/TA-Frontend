"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import ActionButton from "../components/ActionButton";
import ExportButton from "../components/ExportButton";
import CardSection from "../components/CardSection";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { TableEmptyState, TableErrorState } from "../components/TableStates";
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
    <CardSection
      title={title}
      badge={
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
        >
          Total: {totalCount}
        </span>
      }
      actions={
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button type="button" size="sm" variant="secondary">
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
          <div className="flex items-center gap-2 ml-3">
            <Button
              type="button"
              size="sm"
              variant="ternary"
              onClick={onBulkDelete}
              disabled={
                !onBulkDelete ||
                selectedIds.length === 0 ||
                loading ||
                !!isBulkDeleting
              }
              className="text-xs font-semibold"
            >
              Hapus Terpilih
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ternary"
              onClick={onDeleteAll}
              disabled={
                !onDeleteAll ||
                reports.length === 0 ||
                loading ||
                !!isBulkDeleting
              }
              className="text-xs font-semibold"
            >
              Hapus Semua (Halaman)
            </Button>
          </div>
        </div>
      }
      className="mb-6"
    >
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
        <TableErrorState
          message="Gagal memuat data laporan."
          onRetry={onRefresh}
        />
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
                    <td colSpan={8}>
                      <TableEmptyState message="Tidak ada laporan ditemukan." />
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
                        <StatusBadge kind="validation" value={report.status} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge
                          kind="completeness"
                          value={report.completenessStatus}
                          className="capitalize"
                        />
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </CardSection>
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
