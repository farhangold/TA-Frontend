
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import { GET_EVALUATION } from "../graphql/evaluations";

const DetailLaporanContent = () => {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const { data, loading, error } = useQuery(GET_EVALUATION, {
    skip: !reportId,
    variables: { reportId },
    fetchPolicy: "cache-and-network",
  });

  const evaluation = data?.getEvaluation;
  const report = evaluation?.report;

  const status =
    evaluation?.validationStatus === "VALID"
      ? "Valid"
      : evaluation?.validationStatus === "INVALID"
        ? "Invalid"
        : "Pending";

  const statusClass =
    evaluation?.validationStatus === "VALID"
      ? "bg-blue-300 text-blue-800"
      : evaluation?.validationStatus === "INVALID"
        ? "bg-red-300 text-red-800"
        : "bg-yellow-200 text-yellow-800";

  return (
    <DashboardLayout title="Detail Laporan">
      <div className="bg-white rounded-lg p-6 shadow space-y-6">
        {!reportId && (
          <p className="text-sm text-gray-500">
            Tidak ada Report ID yang dipilih. Buka halaman Daftar Laporan dan
            pilih satu laporan untuk melihat detail evaluasinya.
          </p>
        )}

        {reportId && loading && (
          <p className="text-sm text-gray-500">Memuat detail laporan...</p>
        )}

        {reportId && error && !loading && (
          <p className="text-sm text-red-600">
            Gagal memuat detail laporan. Pastikan laporan sudah dievaluasi.
          </p>
        )}

        {reportId && evaluation && report && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {report.testIdentity?.title ?? "Detail Laporan"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  ID Laporan:{" "}
                  <span className="font-mono">
                    {report.testIdentity?.testId ?? report._id}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Versi: {report.testIdentity?.version ?? "-"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
                >
                  {status}
                </span>
                <p className="text-sm text-gray-500">
                  Skor:{" "}
                  <span className="font-semibold text-gray-800">
                    {Math.round(evaluation.scorePercentage)}%
                  </span>{" "}
                  ({evaluation.totalScore.toFixed(1)} /{" "}
                  {evaluation.maxScore.toFixed(1)})
                </p>
                <p className="text-xs text-gray-400">
                  Dievaluasi pada{" "}
                  {new Date(evaluation.evaluatedAt).toLocaleString("id-ID")}
                </p>
                {evaluation.evaluatedBy && (
                  <p className="text-xs text-gray-400">
                    Oleh: {evaluation.evaluatedBy.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Lingkungan Uji
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>OS: {report.testEnvironment?.os ?? "-"}</p>
                  <p>Browser: {report.testEnvironment?.browser ?? "-"}</p>
                  <p>Device: {report.testEnvironment?.device ?? "-"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Tingkat Keparahan
                </h3>
                <p className="text-sm text-gray-600">
                  {report.severityLevel ?? "-"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Langkah Reproduksi
              </h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 bg-gray-50 rounded-md p-3">
                {report.stepsToReproduce?.length
                  ? report.stepsToReproduce.map(
                      (step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ),
                    )
                  : "Tidak ada data langkah reproduksi."}
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Hasil Aktual
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">
                  {report.actualResult}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Hasil yang Diharapkan
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">
                  {report.expectedResult}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

const DetailLaporanPage = () => {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Detail Laporan">
          <div className="bg-white rounded-lg p-6 shadow space-y-4">
            <p className="text-sm text-gray-500">Memuat detail laporan...</p>
          </div>
        </DashboardLayout>
      }
    >
      <DetailLaporanContent />
    </Suspense>
  );
};

export default DetailLaporanPage;
