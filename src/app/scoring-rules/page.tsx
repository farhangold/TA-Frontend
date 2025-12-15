"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import Button from "../components/Button";
import { useCurrentUser } from "../lib/auth";
import {
  GET_SCORING_RULES,
  GET_VALIDATION_CONFIG,
  UPDATE_SCORING_RULE,
  TOGGLE_SCORING_RULE,
  UPDATE_VALIDATION_THRESHOLD,
  RESET_SCORING_RULES_TO_DEFAULT,
} from "../graphql/scoringRules";

type ScoringRule = {
  _id: string;
  attribute: string;
  description: string;
  criteria: string;
  weight: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ValidationConfig = {
  _id: string;
  threshold: number;
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedAt: string;
};

export default function ScoringRulesPage() {
  const { user } = useCurrentUser();
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);
  const [editWeight, setEditWeight] = useState<number>(0);
  const [editCriteria, setEditCriteria] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(70);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { data: rulesData, loading: rulesLoading, error: rulesError, refetch: refetchRules } = useQuery(
    GET_SCORING_RULES,
    {
      fetchPolicy: "cache-and-network",
      skip: !user || (user.role !== "ADMIN" && user.role !== "REVIEWER"),
    }
  );

  const { data: configData, loading: configLoading, error: configError, refetch: refetchConfig } = useQuery(
    GET_VALIDATION_CONFIG,
    {
      fetchPolicy: "cache-and-network",
      skip: !user || (user.role !== "ADMIN" && user.role !== "REVIEWER"),
    }
  );

  const [updateScoringRule] = useMutation(UPDATE_SCORING_RULE);
  const [toggleScoringRule] = useMutation(TOGGLE_SCORING_RULE);
  const [updateValidationThreshold] = useMutation(UPDATE_VALIDATION_THRESHOLD);
  const [resetScoringRules] = useMutation(RESET_SCORING_RULES_TO_DEFAULT);

  const rules: ScoringRule[] = rulesData?.getScoringRules || [];
  const validationConfig: ValidationConfig | null = configData?.getValidationConfig || null;

  // Initialize threshold from config
  React.useEffect(() => {
    if (!configLoading && validationConfig) {
      setThreshold(validationConfig.threshold);
    }
  }, [configLoading, validationConfig]);

  // Check permissions
  if (user && user.role !== "ADMIN" && user.role !== "REVIEWER") {
    return (
      <DashboardLayout title="Scoring Rules">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-red-600">
            Akses ditolak. Hanya admin dan reviewer yang dapat mengakses halaman ini.
          </p>
        </div>
      </DashboardLayout>
    );
  }


  const handleEditClick = (rule: ScoringRule) => {
    if (user?.role !== "ADMIN") {
      alert("Hanya admin yang dapat mengedit scoring rules.");
      return;
    }
    setEditingRule(rule);
    setEditWeight(rule.weight);
    setEditCriteria(rule.criteria);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setEditWeight(0);
    setEditCriteria("");
  };

  const handleSaveEdit = async () => {
    if (!editingRule || user?.role !== "ADMIN") return;

    try {
      await updateScoringRule({
        variables: {
          input: {
            attribute: editingRule.attribute,
            weight: editWeight,
            criteria: editCriteria,
          },
        },
      });
      await refetchRules();
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating scoring rule:", error);
      alert("Gagal memperbarui scoring rule. Silakan coba lagi.");
    }
  };

  const handleToggleRule = async (attribute: string, isActive: boolean) => {
    if (user?.role !== "ADMIN") {
      alert("Hanya admin yang dapat mengaktifkan/menonaktifkan scoring rules.");
      return;
    }

    try {
      await toggleScoringRule({
        variables: {
          attribute,
          isActive: !isActive,
        },
      });
      await refetchRules();
    } catch (error) {
      console.error("Error toggling scoring rule:", error);
      alert("Gagal mengubah status scoring rule. Silakan coba lagi.");
    }
  };

  const handleUpdateThreshold = async () => {
    if (user?.role !== "ADMIN") {
      alert("Hanya admin yang dapat mengubah validation threshold.");
      return;
    }

    if (threshold < 0 || threshold > 100) {
      alert("Threshold harus antara 0 dan 100.");
      return;
    }

    try {
      await updateValidationThreshold({
        variables: {
          threshold,
        },
      });
      await refetchConfig();
      alert("Validation threshold berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating threshold:", error);
      alert("Gagal memperbarui validation threshold. Silakan coba lagi.");
    }
  };

  const handleResetToDefault = async () => {
    if (user?.role !== "ADMIN") {
      alert("Hanya admin yang dapat mereset scoring rules.");
      return;
    }

    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    try {
      await resetScoringRules();
      await refetchRules();
      await refetchConfig();
      setShowResetConfirm(false);
      alert("Scoring rules berhasil direset ke default.");
    } catch (error) {
      console.error("Error resetting scoring rules:", error);
      alert("Gagal mereset scoring rules. Silakan coba lagi.");
    }
  };

  const getAttributeLabel = (attribute: string): string => {
    const labels: Record<string, string> = {
      TEST_IDENTITY: "Test Identity",
      TEST_ENVIRONMENT: "Test Environment",
      STEPS_TO_REPRODUCE: "Steps to Reproduce",
      ACTUAL_RESULT: "Actual Result",
      EXPECTED_RESULT: "Expected Result",
      SUPPORTING_EVIDENCE: "Supporting Evidence",
      SEVERITY_LEVEL: "Severity Level",
      INFORMATION_CONSISTENCY: "Information Consistency",
    };
    return labels[attribute] || attribute;
  };

  if (rulesLoading || configLoading) {
    return (
      <DashboardLayout title="Scoring Rules">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-gray-500">Memuat scoring rules...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (rulesError || configError) {
    return (
      <DashboardLayout title="Scoring Rules">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-red-600">
            Gagal memuat scoring rules. Pastikan Anda memiliki akses yang diperlukan.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Scoring Rules">
      <div className="space-y-6">
        {/* Validation Threshold Section */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Validation Threshold
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                disabled={user?.role !== "ADMIN"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laporan dengan skor di atas threshold ini akan dianggap valid.
              </p>
            </div>
            {user?.role === "ADMIN" && (
              <Button
                type="button"
                onClick={handleUpdateThreshold}
                size="sm"
                variant="primary"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Simpan Threshold
              </Button>
            )}
          </div>
          {validationConfig && (
            <p className="text-xs text-gray-500 mt-2">
              Terakhir diperbarui:{" "}
              {new Date(validationConfig.updatedAt).toLocaleString("id-ID")}
              {validationConfig.updatedBy && (
                <> oleh {validationConfig.updatedBy.name}</>
              )}
            </p>
          )}
        </div>

        {/* Scoring Rules Table */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Scoring Rules
            </h2>
            {user?.role === "ADMIN" && (
              <Button
                type="button"
                onClick={handleResetToDefault}
                size="sm"
                variant={showResetConfirm ? "danger" : "secondary"}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showResetConfirm
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {showResetConfirm ? "Konfirmasi Reset" : "Reset ke Default"}
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                  <th className="py-3 px-4 text-left">Attribute</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Criteria</th>
                  <th className="py-3 px-4 text-center">Weight</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {user?.role === "ADMIN" && (
                    <th className="py-3 px-4 text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {rules.map((rule) => (
                  <tr
                    key={rule._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-left font-medium">
                      {getAttributeLabel(rule.attribute)}
                    </td>
                    <td className="py-3 px-4 text-left">
                      {editingRule?._id === rule._id ? (
                        <input
                          type="text"
                          value={editCriteria}
                          onChange={(e) => setEditCriteria(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Criteria"
                        />
                      ) : (
                        <span className="text-xs">{rule.criteria}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <span className="text-xs text-gray-500">
                        {rule.description}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingRule?._id === rule._id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editWeight}
                          onChange={(e) => setEditWeight(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                        />
                      ) : (
                        <span className="font-medium">{rule.weight}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        type="button"
                        onClick={() =>
                          handleToggleRule(rule.attribute, rule.isActive)
                        }
                        disabled={user?.role !== "ADMIN"}
                        size="sm"
                        variant="secondary"
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        } ${
                          user?.role === "ADMIN"
                            ? "hover:opacity-80 cursor-pointer"
                            : "cursor-not-allowed"
                        }`}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </Button>
                    </td>
                    {user?.role === "ADMIN" && (
                      <td className="py-3 px-4 text-center">
                        {editingRule?._id === rule._id ? (
                          <div className="flex gap-2 justify-center">
                            <Button
                              type="button"
                              onClick={handleSaveEdit}
                              size="sm"
                              variant="primary"
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              Simpan
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCancelEdit}
                              size="sm"
                              variant="secondary"
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleEditClick(rule)}
                            size="sm"
                            variant="primary"
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rules.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Tidak ada scoring rules yang ditemukan.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

