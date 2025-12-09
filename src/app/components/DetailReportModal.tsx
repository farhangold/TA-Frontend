"use client";

import React from "react";

type EvaluationData = {
  reportId?: string;
  reportType?: string;
  totalScore?: number;
  maxScore?: number;
  scorePercentage?: number;
  validationStatus?: string;
  evaluatedAt?: string;
  evaluatedBy?: {
    name?: string;
    email?: string;
  };
  processingTime?: number;
  version?: number;
  report?: {
    _id?: string;
    reportType?: string;
    testIdentity?: {
      testId?: string;
      title?: string;
      version?: string;
    };
    testEnvironment?: {
      os?: string;
      browser?: string;
      device?: string;
      additionalInfo?: string;
    };
    stepsToReproduce?: string[];
    actualResult?: string;
    expectedResult?: string;
    supportingEvidence?: Array<{
      type?: string;
      url?: string;
      description?: string;
    }>;
    severityLevel?: string;
    domain?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  attributeScores?: Array<{
    attribute?: string;
    score?: number;
    maxScore?: number;
    weight?: number;
    weightedScore?: number;
    passed?: boolean;
  }>;
  feedback?: Array<{
    attribute?: string;
    message?: string;
    level?: string;
  }>;
};

type DetailReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationData | null | undefined;
  loading: boolean;
};

const DetailReportModal = ({
  isOpen,
  onClose,
  evaluation,
  loading,
}: DetailReportModalProps) => {
  if (!isOpen) return null;

  const report = evaluation?.report;
  const status = evaluation?.validationStatus;

  const getStatusBadgeClass = (status: string) => {
    if (status === "VALID")
      return "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md";
    if (status === "INVALID" || status === "FAILED")
      return "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md";
    return "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md animate-pulse";
  };

  const getReportTypeBadge = (reportType: string) => {
    if (reportType === "BUG_REPORT")
      return "bg-gradient-to-r from-red-400 to-rose-500 text-white";
    return "bg-gradient-to-r from-green-400 to-emerald-500 text-white";
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-300 border border-gray-200/50">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Detail Laporan</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-gray-600">
                  Memuat detail laporan...
                </span>
              </div>
            </div>
          )}

          {!loading && !evaluation && (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                Tidak ada data evaluasi untuk laporan ini.
              </p>
            </div>
          )}

          {!loading && evaluation && report && (
            <div className="space-y-6">
              {/* Status & Score Section */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200/50 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                        status || "PENDING"
                      )}`}
                    >
                      {status === "VALID"
                        ? "VALID"
                        : status === "INVALID"
                          ? "INVALID"
                          : "PENDING"}
                    </span>
                    {report.reportType && (
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getReportTypeBadge(
                          report.reportType
                        )}`}
                      >
                        {report.reportType === "BUG_REPORT"
                          ? "Bug Report"
                          : "Success Report"}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {Math.round(evaluation.scorePercentage || 0)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {evaluation.totalScore?.toFixed(1) || 0} /{" "}
                      {evaluation.maxScore?.toFixed(1) || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Information */}
              <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Informasi Laporan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Test ID
                    </label>
                    <p className="text-gray-900 font-medium">
                      {report.testIdentity?.testId || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Title
                    </label>
                    <p className="text-gray-900 font-medium">
                      {report.testIdentity?.title || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Version
                    </label>
                    <p className="text-gray-900 font-medium">
                      {report.testIdentity?.version || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Domain
                    </label>
                    <p className="text-gray-900 font-medium">
                      {report.domain || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Severity Level
                    </label>
                    <p className="text-gray-900 font-medium">
                      {report.severityLevel || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Created At
                    </label>
                    <p className="text-gray-900 font-medium">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Environment */}
              {report.testEnvironment && (
                <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Test Environment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        OS
                      </label>
                      <p className="text-gray-900 font-medium">
                        {report.testEnvironment.os || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Browser
                      </label>
                      <p className="text-gray-900 font-medium">
                        {report.testEnvironment.browser || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Device
                      </label>
                      <p className="text-gray-900 font-medium">
                        {report.testEnvironment.device || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actual Result */}
              {report.actualResult && (
                <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Actual Result / Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {report.actualResult}
                  </p>
                </div>
              )}

              {/* Steps to Reproduce (Bug Report only) */}
              {report.stepsToReproduce &&
                report.stepsToReproduce.length > 0 && (
                  <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Steps to Reproduce
                    </h3>
                    <ol className="list-decimal list-inside space-y-2">
                      {report.stepsToReproduce.map(
                        (step: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {step}
                          </li>
                        )
                      )}
                    </ol>
                  </div>
                )}

              {/* Expected Result */}
              {report.expectedResult && (
                <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Expected Result
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {report.expectedResult}
                  </p>
                </div>
              )}

              {/* Supporting Evidence */}
              {report.supportingEvidence &&
                report.supportingEvidence.length > 0 && (
                  <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Supporting Evidence
                    </h3>
                    <div className="space-y-3">
                      {report.supportingEvidence.map(
                        (evidence: { type?: string; url?: string; description?: string }, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              {evidence.type || "SCREENSHOT"}
                            </div>
                            {evidence.url && (
                              <a
                                href={evidence.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm break-all"
                              >
                                {evidence.url}
                              </a>
                            )}
                            {evidence.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {evidence.description}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Evaluation Scores */}
              {evaluation.attributeScores &&
                evaluation.attributeScores.length > 0 && (
                  <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Attribute Scores
                    </h3>
                    <div className="space-y-3">
                      {evaluation.attributeScores.map(
                        (attrScore: { attribute?: string; score?: number; maxScore?: number; weight?: number; weightedScore?: number; passed?: boolean }, index: number) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">
                                {attrScore.attribute}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {attrScore.score !== undefined
                                    ? attrScore.score.toFixed(1)
                                    : "-"}{" "}
                                  /{" "}
                                  {attrScore.maxScore !== undefined
                                    ? attrScore.maxScore.toFixed(1)
                                    : "-"}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    attrScore.passed
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {attrScore.passed ? "PASS" : "FAIL"}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  attrScore.passed
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : "bg-gradient-to-r from-red-400 to-rose-500"
                                }`}
                                style={{
                                  width: `${
                                    attrScore.score !== undefined &&
                                    attrScore.maxScore !== undefined &&
                                    attrScore.maxScore > 0
                                      ? (attrScore.score / attrScore.maxScore) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Weight: {attrScore.weight} | Weighted Score:{" "}
                              {attrScore.weightedScore?.toFixed(2) || 0}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Feedback */}
              {evaluation.feedback && evaluation.feedback.length > 0 && (
                <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Feedback
                  </h3>
                  <div className="space-y-3">
                    {evaluation.feedback.map((fb: { attribute?: string; message?: string; level?: string }, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          fb.level === "ERROR"
                            ? "bg-red-50 border-red-200"
                            : fb.level === "WARNING"
                              ? "bg-amber-50 border-amber-200"
                              : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 ${
                              fb.level === "ERROR"
                                ? "text-red-600"
                                : fb.level === "WARNING"
                                  ? "text-amber-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {fb.level === "ERROR" ? (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : fb.level === "WARNING" ? (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">
                              {fb.attribute}
                            </div>
                            <p className="text-sm text-gray-700">{fb.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Info */}
              <div className="bg-white bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Evaluation Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Evaluated At
                    </label>
                    <p className="text-gray-900 font-medium">
                      {evaluation.evaluatedAt
                        ? new Date(evaluation.evaluatedAt).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>
                  {evaluation.evaluatedBy && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Evaluated By
                      </label>
                      <p className="text-gray-900 font-medium">
                        {evaluation.evaluatedBy.name || evaluation.evaluatedBy.email}
                      </p>
                    </div>
                  )}
                  {evaluation.processingTime !== undefined && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Processing Time
                      </label>
                      <p className="text-gray-900 font-medium">
                        {evaluation.processingTime}ms
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Version
                    </label>
                    <p className="text-gray-900 font-medium">
                      {evaluation.version || 1}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailReportModal;

