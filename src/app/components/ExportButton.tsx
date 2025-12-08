"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExportFormat } from "../utils/exportUtils";

type ReportData = {
  _id?: string;
  testIdentity?: {
    testId?: string;
    title?: string;
    version?: string;
  };
  [key: string]: unknown;
};

type ExportButtonProps = {
  reports: ReportData[];
  reportType: "valid" | "invalid";
  loading?: boolean;
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
};

const ExportButton = ({
  reports,
  loading = false,
  onExport,
  disabled = false,
}: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    setIsOpen(false);
  };

  const isDisabled = disabled || loading || reports.length === 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105 active:scale-95"
        }`}
        title={isDisabled ? "Tidak ada data untuk diekspor" : "Ekspor laporan"}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Mengekspor...</span>
          </>
        ) : (
          <>
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span>Ekspor</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            <button
              onClick={() => handleExport("CSV")}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">CSV</div>
                <div className="text-xs text-gray-500">Comma separated values</div>
              </div>
            </button>

            <button
              onClick={() => handleExport("EXCEL")}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">Excel</div>
                <div className="text-xs text-gray-500">Microsoft Excel (.xlsx)</div>
              </div>
            </button>

            <button
              onClick={() => handleExport("PDF")}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-red-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">PDF</div>
                <div className="text-xs text-gray-500">Portable Document Format</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;

