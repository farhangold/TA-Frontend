
"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import { GET_EVALUATION_HISTORY } from "../graphql/evaluations";

const ITEMS_PER_PAGE = 10;

type EvaluationRow = {
  id: string;
  version: number;
  statusLabel: string;
  statusRaw: string;
  date: string;
  reporter: string;
  score: string;
  title: string;
};

const mapStatusToLabel = (status: string) => {
  if (status === "VALID") return "Valid";
  if (status === "INVALID") return "Invalid";
  return "Pending";
};

const getStatusBadgeClass = (status: string) => {
  if (status === "VALID") return "bg-blue-300 text-blue-800";
  if (status === "INVALID") return "bg-red-300 text-red-800";
  return "bg-yellow-200 text-yellow-800";
};

const HasilValidasiContent = () => {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, error } = useQuery(GET_EVALUATION_HISTORY, {
    skip: !reportId,
    variables: {
      reportId,
      pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
    },
    fetchPolicy: "cache-and-network",
  });

  const evaluations: EvaluationRow[] = useMemo(() => {
    if (!data?.getEvaluationHistory) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.getEvaluationHistory.edges.map((edge: any, index: number) => {
      const node = edge.node;
      const evaluatedAt = new Date(node.evaluatedAt);
      const label = mapStatusToLabel(node.validationStatus);

      return {
        id: `#${node.report?.testIdentity?.testId ?? node.reportId}`,
        version: node.version ?? index + 1,
        statusLabel: label,
        statusRaw: node.validationStatus,
        date: evaluatedAt.toLocaleDateString("id-ID"),
        reporter: node.evaluatedBy?.name ?? node.evaluatedBy?.email ?? "-",
        score: `${Math.round(node.scorePercentage)}%`,
        title: node.report?.testIdentity?.title ?? "Evaluasi laporan",
      };
    });
  }, [data]);

  const totalCount = data?.getEvaluationHistory?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    <DashboardLayout title="Hasil Validasi">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hasil Validasi Laporan Bug</h2>
          <div className="text-xs text-gray-500">
            {reportId
              ? `Riwayat validasi untuk Report ID: ${reportId}`
              : "Pilih laporan dari Daftar Laporan untuk melihat hasil validasi."}
          </div>
        </div>

        {!reportId && (
          <div className="py-12 text-center text-sm text-gray-500">
            Tidak ada Report ID yang dipilih. Buka halaman Daftar Laporan dan
            pilih satu laporan untuk melihat riwayat validasinya.
          </div>
        )}

        {reportId && loading && (
          <div className="py-8 text-center text-sm text-gray-500">
            Memuat hasil validasi...
          </div>
        )}

        {reportId && error && !loading && (
          <div className="py-8 text-center text-sm text-red-600">
            Gagal memuat hasil validasi.
          </div>
        )}

        {reportId && !loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                    <th className="py-3 px-4 text-left w-24">ID</th>
                    <th className="py-3 px-4 text-left">Deskripsi Bug</th>
                    <th className="py-3 px-4 text-center w-28">Status</th>
                    <th className="py-3 px-4 text-center w-24">Skor</th>
                    <th className="py-3 px-4 text-center w-36">
                      Tanggal Validasi
                    </th>
                    <th className="py-3 px-4 text-center w-32">
                      Crowdworker
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {evaluations.map((evaluation) => (
                    <tr
                      key={`${evaluation.id}-${evaluation.version}`}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-left font-medium">
                        {evaluation.id}
                      </td>
                      <td className="py-3 px-4 text-left">
                        {evaluation.title}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeClass(
                              evaluation.statusRaw,
                            )}`}
                          >
                            {evaluation.statusLabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {evaluation.score}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {evaluation.date}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {evaluation.reporter}
                      </td>
                    </tr>
                  ))}
                  {evaluations.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-sm text-gray-500"
                      >
                        Belum ada riwayat validasi untuk laporan ini.
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
    </DashboardLayout>
  );
};

const HasilValidasiPage = () => {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Hasil Validasi">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="py-8 text-center text-sm text-gray-500">
              Memuat hasil validasi...
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <HasilValidasiContent />
    </Suspense>
  );
};

export default HasilValidasiPage;
