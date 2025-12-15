// src/app/components/TableStates.tsx
"use client";

import * as React from "react";
import Button from "./Button";

type TableStateBaseProps = {
  title?: string;
  message: string;
  className?: string;
};

type TableErrorStateProps = TableStateBaseProps & {
  onRetry?: () => void;
};

export const TableEmptyState: React.FC<TableStateBaseProps> = ({
  title = "Tidak ada data",
  message,
  className,
}) => {
  return (
    <div
      className={`py-8 flex flex-col items-center justify-center text-sm text-gray-500 ${className ?? ""}`}
    >
      <div className="mb-2 rounded-full bg-gray-100 p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-5 h-5 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 13.5l3 3L22.5 6M4.5 6.75h5.25m-5.25 4.5H7.5m-3 4.5H9"
          />
        </svg>
      </div>
      <p className="font-medium text-gray-700">{title}</p>
      <p className="mt-1 max-w-md text-center text-gray-500">{message}</p>
    </div>
  );
};

export const TableErrorState: React.FC<TableErrorStateProps> = ({
  title = "Gagal memuat data",
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={`py-8 flex flex-col items-center justify-center text-sm text-red-600 ${className ?? ""}`}
    >
      <div className="mb-2 rounded-full bg-red-50 p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-5 h-5 text-red-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h17.78A1.5 1.5 0 0022.18 18L13.71 3.86a1.5 1.5 0 00-2.42 0z"
          />
        </svg>
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-md text-center text-red-500">{message}</p>
      {onRetry && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onRetry}
          className="mt-3"
        >
          Coba lagi
        </Button>
      )}
    </div>
  );
};

export default TableEmptyState;


