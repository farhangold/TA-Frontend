// src/app/components/StatusBadge.tsx
"use client";

import * as React from "react";

type StatusBadgeKind =
  | "validation"
  | "completeness"
  | "reportType"
  | "role"
  | "generic";

type StatusBadgeProps = {
  kind: StatusBadgeKind;
  value: string | null | undefined;
  className?: string;
};

type ClassValue = string | false | null | undefined;

function cn(...classes: ClassValue[]) {
  return classes.filter((cls): cls is string => typeof cls === "string").join(" ");
}

function getClasses(kind: StatusBadgeKind, value: string | null | undefined): string {
  const v = (value || "").toUpperCase();

  if (kind === "validation") {
    if (v === "VALID") return "bg-green-100 text-green-800";
    if (v === "INVALID" || v === "FAILED") return "bg-red-100 text-red-800";
    return "bg-amber-100 text-amber-800";
  }

  if (kind === "completeness") {
    if (v === "COMPLETE") return "bg-emerald-100 text-emerald-800";
    if (v === "INCOMPLETE") return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-500";
  }

  if (kind === "reportType") {
    if (v === "BUG_REPORT") return "bg-rose-100 text-rose-800";
    if (v === "SUCCESS_REPORT") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-600";
  }

  if (kind === "role") {
    if (v === "ADMIN") return "bg-purple-300 text-purple-800";
    if (v === "REVIEWER") return "bg-blue-300 text-blue-800";
    return "bg-gray-300 text-gray-800";
  }

  // generic
  return "bg-gray-100 text-gray-700";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ kind, value, className }) => {
  if (!value) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        getClasses(kind, value),
        className
      )}
    >
      {kind === "completeness" && value.toUpperCase() === "COMPLETE" && "✓ "}
      {kind === "completeness" && value.toUpperCase() === "INCOMPLETE" && "⚠ "}
      {value}
    </span>
  );
};

export default StatusBadge;


