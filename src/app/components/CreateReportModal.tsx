"use client";

import React, { useState } from "react";

type TestIdentityInput = {
  testId: string;
  title: string;
  version: string;
};

type TestEnvironmentInput = {
  os: string;
  browser: string;
  device: string;
  additionalInfo?: string;
};

type EvidenceInput = {
  type: "SCREENSHOT" | "VIDEO" | "LOG" | "DOCUMENT";
  url: string;
  description?: string;
};

type CreateUATReportInput = {
  testIdentity: TestIdentityInput;
  testEnvironment: TestEnvironmentInput;
  stepsToReproduce: string[];
  actualResult: string;
  expectedResult: string;
  supportingEvidence?: EvidenceInput[];
  severityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  domain?: string;
  additionalInfo?: string;
};

type CreateReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUATReportInput) => Promise<void>;
  loading?: boolean;
};

const CreateReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreateReportModalProps) => {
  const [formData, setFormData] = useState<CreateUATReportInput>({
    testIdentity: {
      testId: "",
      title: "",
      version: "",
    },
    testEnvironment: {
      os: "",
      browser: "",
      device: "",
      additionalInfo: "",
    },
    stepsToReproduce: [""],
    actualResult: "",
    expectedResult: "",
    supportingEvidence: [],
    severityLevel: "LOW",
    domain: "",
    additionalInfo: "",
  });

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | string[]>
  >({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string | string[]> = {};

    // Test Identity validation
    if (!formData.testIdentity.testId.trim()) {
      errors["testIdentity.testId"] = "Test ID harus diisi";
    }
    if (!formData.testIdentity.title.trim()) {
      errors["testIdentity.title"] = "Title harus diisi";
    }
    if (!formData.testIdentity.version.trim()) {
      errors["testIdentity.version"] = "Version harus diisi";
    }

    // Test Environment validation
    if (!formData.testEnvironment.os.trim()) {
      errors["testEnvironment.os"] = "OS harus diisi";
    }
    if (!formData.testEnvironment.browser.trim()) {
      errors["testEnvironment.browser"] = "Browser harus diisi";
    }
    if (!formData.testEnvironment.device.trim()) {
      errors["testEnvironment.device"] = "Device harus diisi";
    }

    // Steps to Reproduce validation
    const validSteps = formData.stepsToReproduce.filter((step) =>
      step.trim(),
    );
    if (validSteps.length === 0) {
      errors["stepsToReproduce"] = "Minimal satu langkah harus diisi";
    } else {
      const stepErrors: string[] = [];
      formData.stepsToReproduce.forEach((step, index) => {
        if (!step.trim() && index < formData.stepsToReproduce.length - 1) {
          stepErrors[index] = "Langkah tidak boleh kosong";
        }
      });
      if (stepErrors.length > 0) {
        errors["stepsToReproduce"] = stepErrors;
      }
    }

    // Actual Result validation
    if (!formData.actualResult.trim()) {
      errors["actualResult"] = "Actual Result harus diisi";
    }

    // Expected Result validation
    if (!formData.expectedResult.trim()) {
      errors["expectedResult"] = "Expected Result harus diisi";
    }

    // Supporting Evidence validation
    if (formData.supportingEvidence && formData.supportingEvidence.length > 0) {
      const evidenceErrors: string[] = [];
      formData.supportingEvidence.forEach((evidence, index) => {
        if (!evidence.url.trim()) {
          evidenceErrors[index] = "URL harus diisi";
        }
      });
      if (evidenceErrors.length > 0) {
        errors["supportingEvidence"] = evidenceErrors;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      // Filter out empty steps
      const validSteps = formData.stepsToReproduce.filter((step) =>
        step.trim(),
      );

      // Filter out empty evidence
      const validEvidence =
        formData.supportingEvidence && formData.supportingEvidence.length > 0
          ? formData.supportingEvidence
              .filter((e) => e.url.trim())
              .map((e) => ({
                type: e.type,
                url: e.url.trim(),
                description: e.description?.trim() || undefined,
              }))
          : undefined;

      const submitData: CreateUATReportInput = {
        testIdentity: {
          testId: formData.testIdentity.testId.trim(),
          title: formData.testIdentity.title.trim(),
          version: formData.testIdentity.version.trim(),
        },
        testEnvironment: {
          os: formData.testEnvironment.os.trim(),
          browser: formData.testEnvironment.browser.trim(),
          device: formData.testEnvironment.device.trim(),
          additionalInfo: formData.testEnvironment.additionalInfo?.trim() || undefined,
        },
        stepsToReproduce: validSteps.map((step) => step.trim()),
        actualResult: formData.actualResult.trim(),
        expectedResult: formData.expectedResult.trim(),
        severityLevel: formData.severityLevel,
        supportingEvidence: validEvidence,
        domain: formData.domain?.trim() || undefined,
        additionalInfo: formData.additionalInfo?.trim() || undefined,
      };

      await onSubmit(submitData);

      // Reset form after successful submit
      setFormData({
        testIdentity: {
          testId: "",
          title: "",
          version: "",
        },
        testEnvironment: {
          os: "",
          browser: "",
          device: "",
          additionalInfo: "",
        },
        stepsToReproduce: [""],
        actualResult: "",
        expectedResult: "",
        supportingEvidence: [],
        severityLevel: "LOW",
        domain: "",
        additionalInfo: "",
      });
      setFieldErrors({});
      setFormError(null);
    } catch (error: unknown) {
      console.error("Error creating report:", error);
      
      // Extract detailed error message from GraphQL error
      const graphQLError = (error as { graphQLErrors?: Array<{ message?: string; extensions?: Record<string, unknown> }> })?.graphQLErrors?.[0];
      let errorMessage = "Gagal membuat laporan. Silakan coba lagi.";
      
      if (graphQLError) {
        // Check for validation errors in extensions
        if (graphQLError.extensions?.exception?.response?.message) {
          const validationErrors = graphQLError.extensions.exception.response.message;
          if (Array.isArray(validationErrors)) {
            errorMessage = validationErrors.join(", ");
          } else if (typeof validationErrors === "string") {
            errorMessage = validationErrors;
          } else {
            errorMessage = graphQLError.message;
          }
        } else if (graphQLError.extensions?.response?.message) {
          const validationErrors = graphQLError.extensions.response.message;
          if (Array.isArray(validationErrors)) {
            errorMessage = validationErrors.join(", ");
          } else if (typeof validationErrors === "string") {
            errorMessage = validationErrors;
          } else {
            errorMessage = graphQLError.message;
          }
        } else {
          errorMessage = graphQLError.message || errorMessage;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setFormError(errorMessage);
    }
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      stepsToReproduce: [...formData.stepsToReproduce, ""],
    });
  };

  const handleRemoveStep = (index: number) => {
    if (formData.stepsToReproduce.length > 1) {
      const newSteps = formData.stepsToReproduce.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        stepsToReproduce: newSteps,
      });
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.stepsToReproduce];
    newSteps[index] = value;
    setFormData({
      ...formData,
      stepsToReproduce: newSteps,
    });
    // Clear error for this step
    if (fieldErrors["stepsToReproduce"]) {
      const stepErrors = Array.isArray(fieldErrors["stepsToReproduce"])
        ? [...fieldErrors["stepsToReproduce"]]
        : [];
      delete stepErrors[index];
      setFieldErrors({
        ...fieldErrors,
        stepsToReproduce: stepErrors,
      });
    }
  };

  const handleAddEvidence = () => {
    setFormData({
      ...formData,
      supportingEvidence: [
        ...(formData.supportingEvidence || []),
        { type: "SCREENSHOT", url: "", description: "" },
      ],
    });
  };

  const handleRemoveEvidence = (index: number) => {
    const newEvidence = (formData.supportingEvidence || []).filter(
      (_, i) => i !== index,
    );
    setFormData({
      ...formData,
      supportingEvidence: newEvidence,
    });
  };

  const handleEvidenceChange = (
    index: number,
    field: keyof EvidenceInput,
    value: string,
  ) => {
    const newEvidence = [...(formData.supportingEvidence || [])];
    newEvidence[index] = {
      ...newEvidence[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      supportingEvidence: newEvidence,
    });
    // Clear error for this evidence
    if (fieldErrors["supportingEvidence"]) {
      const evidenceErrors = Array.isArray(fieldErrors["supportingEvidence"])
        ? [...fieldErrors["supportingEvidence"]]
        : [];
      delete evidenceErrors[index];
      setFieldErrors({
        ...fieldErrors,
        supportingEvidence: evidenceErrors,
      });
    }
  };

  const getFieldError = (fieldPath: string, index?: number): string | null => {
    if (index !== undefined) {
      const arrayErrors = fieldErrors[fieldPath];
      if (Array.isArray(arrayErrors) && arrayErrors[index]) {
        return arrayErrors[index];
      }
      return null;
    }
    const error = fieldErrors[fieldPath];
    return typeof error === "string" ? error : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-[101]">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center mb-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="mr-2 text-gray-800 hover:text-gray-600 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-gray-900">
              Tambah Laporan Baru
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Error */}
            {formError && (
              <div
                className="p-3 rounded-lg bg-red-50 border border-red-200"
                role="alert"
              >
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}

            {/* Test Identity Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Test Identity
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Test ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.testIdentity.testId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testIdentity: {
                          ...formData.testIdentity,
                          testId: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("testIdentity.testId")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Masukkan Test ID"
                    disabled={loading}
                  />
                  {getFieldError("testIdentity.testId") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("testIdentity.testId")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.testIdentity.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testIdentity: {
                          ...formData.testIdentity,
                          title: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("testIdentity.title")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Masukkan Title"
                    disabled={loading}
                  />
                  {getFieldError("testIdentity.title") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("testIdentity.title")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.testIdentity.version}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testIdentity: {
                          ...formData.testIdentity,
                          version: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("testIdentity.version")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Masukkan Version"
                    disabled={loading}
                  />
                  {getFieldError("testIdentity.version") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("testIdentity.version")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Test Environment Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Test Environment
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    OS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.testEnvironment.os}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testEnvironment: {
                          ...formData.testEnvironment,
                          os: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("testEnvironment.os")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Contoh: Windows 10, macOS, Linux"
                    disabled={loading}
                  />
                  {getFieldError("testEnvironment.os") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("testEnvironment.os")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Browser <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.testEnvironment.browser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testEnvironment: {
                          ...formData.testEnvironment,
                          browser: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("testEnvironment.browser")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Contoh: Chrome, Firefox, Safari"
                    disabled={loading}
                  />
                  {getFieldError("testEnvironment.browser") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("testEnvironment.browser")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Device <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.testEnvironment.device}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testEnvironment: {
                          ...formData.testEnvironment,
                          device: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("testEnvironment.device")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Contoh: Desktop, Mobile, Tablet"
                    disabled={loading}
                  />
                  {getFieldError("testEnvironment.device") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("testEnvironment.device")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Additional Info
                  </label>
                  <textarea
                    value={formData.testEnvironment.additionalInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testEnvironment: {
                          ...formData.testEnvironment,
                          additionalInfo: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Informasi tambahan tentang environment"
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Bug Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Bug Details
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-900">
                      Steps to Reproduce <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddStep}
                      disabled={loading}
                      className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      + Tambah Langkah
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.stepsToReproduce.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1">
                          <textarea
                            value={step}
                            onChange={(e) =>
                              handleStepChange(index, e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                              getFieldError("stepsToReproduce", index)
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder={`Langkah ${index + 1}`}
                            rows={2}
                            disabled={loading}
                          />
                          {getFieldError("stepsToReproduce", index) && (
                            <p className="mt-1 text-xs text-red-600">
                              {getFieldError("stepsToReproduce", index)}
                            </p>
                          )}
                        </div>
                        {formData.stepsToReproduce.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(index)}
                            disabled={loading}
                            className="px-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {typeof fieldErrors["stepsToReproduce"] === "string" && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors["stepsToReproduce"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Actual Result <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.actualResult}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actualResult: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("actualResult")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Hasil yang terjadi saat ini"
                    rows={4}
                    disabled={loading}
                  />
                  {getFieldError("actualResult") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("actualResult")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Expected Result <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.expectedResult}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedResult: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                      getFieldError("expectedResult")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Hasil yang diharapkan"
                    rows={4}
                    disabled={loading}
                  />
                  {getFieldError("expectedResult") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("expectedResult")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Severity & Domain Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Severity & Domain
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Severity Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.severityLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        severityLevel: e.target.value as
                          | "LOW"
                          | "MEDIUM"
                          | "HIGH"
                          | "CRITICAL",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        domain: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: example.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Additional Info
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalInfo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Informasi tambahan"
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Supporting Evidence Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Supporting Evidence
                </h3>
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  + Tambah Evidence
                </button>
              </div>
              {formData.supportingEvidence &&
                formData.supportingEvidence.length > 0 && (
                  <div className="space-y-3">
                    {formData.supportingEvidence.map((evidence, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-300 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-900">
                            Evidence {index + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveEvidence(index)}
                            disabled={loading}
                            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">
                            Type
                          </label>
                          <select
                            value={evidence.type}
                            onChange={(e) =>
                              handleEvidenceChange(
                                index,
                                "type",
                                e.target.value,
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                          >
                            <option value="SCREENSHOT">Screenshot</option>
                            <option value="VIDEO">Video</option>
                            <option value="LOG">Log</option>
                            <option value="DOCUMENT">Document</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">
                            URL <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="url"
                            value={evidence.url}
                            onChange={(e) =>
                              handleEvidenceChange(index, "url", e.target.value)
                            }
                            className={`w-full px-2 py-1 border rounded text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                              getFieldError("supportingEvidence", index)
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="https://example.com/evidence.png"
                            disabled={loading}
                          />
                          {getFieldError("supportingEvidence", index) && (
                            <p className="mt-1 text-xs text-red-600">
                              {getFieldError("supportingEvidence", index)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">
                            Description
                          </label>
                          <textarea
                            value={evidence.description || ""}
                            onChange={(e) =>
                              handleEvidenceChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Deskripsi evidence"
                            rows={2}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              {(!formData.supportingEvidence ||
                formData.supportingEvidence.length === 0) && (
                <p className="text-xs text-gray-500 italic">
                  Tidak ada evidence. Klik &quot;Tambah Evidence&quot; untuk menambahkan.
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Menyimpan...
                  </span>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReportModal;

