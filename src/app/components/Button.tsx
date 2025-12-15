// src/app/components/Button.tsx
"use client";

import * as React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline"
  | "success";

type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-95 focus-visible:ring-blue-400",
  secondary:
    "bg-gray-100 text-gray-900 shadow hover:bg-gray-200 hover:shadow-md hover:scale-[1.01] active:scale-95 focus-visible:ring-gray-300",
  danger:
    "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:scale-[1.02] active:scale-95 focus-visible:ring-red-400",
  success:
    "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-95 focus-visible:ring-emerald-400",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 focus-visible:ring-gray-300",
  outline:
    "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500 hover:text-blue-600 hover:shadow-md hover:scale-[1.01] active:scale-95 focus-visible:ring-blue-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-4 py-3.5 text-base",
  icon: "w-9 h-9 text-sm",
};

const spinnerSvg = (
  <svg
    className="animate-spin h-5 w-5 text-current"
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
);

type ClassValue = string | false | null | undefined;

function cn(...classes: ClassValue[]) {
  return classes.filter((cls): cls is string => typeof cls === "string").join(" ");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      fullWidth,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const hasAdornment = Boolean(leftIcon) || Boolean(rightIcon) || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          hasAdornment && "gap-2",
          className
        )}
        {...props}
      >
        {loading ? spinnerSvg : leftIcon}
        {children && <span>{children}</span>}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;


