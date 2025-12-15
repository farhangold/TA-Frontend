// src/app/components/FormField.tsx
"use client";

import * as React from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  children,
  error,
  description,
  required,
  className,
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-900 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;


