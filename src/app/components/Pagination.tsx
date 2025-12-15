// src/app/components/Pagination.tsx
"use client";

import * as React from "react";
import Button from "./Button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

type ClassValue = string | false | null | undefined;

function cn(...classes: ClassValue[]) {
  return classes.filter((cls): cls is string => typeof cls === "string").join(" ");
}

function getPageNumbers(current: number, total: number, radius = 2): number[] {
  const pages: number[] = [];
  let start = Math.max(1, current - radius);
  const end = Math.min(total, start + radius * 2);

  if (end - start < radius * 2) {
    start = Math.max(1, end - radius * 2);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn(
        "flex items-center space-x-1 text-sm",
        className
      )}
    >
      <span className="text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex ml-2">
        <Button
          type="button"
          onClick={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          size="sm"
          variant="secondary"
          className="px-3 py-1 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Previous page"
        >
          Prev
        </Button>

        {pages.map((page) => (
          <Button
            key={page}
            type="button"
            onClick={() => onChange(page)}
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
          onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          size="sm"
          variant="secondary"
          className="px-3 py-1 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;


