"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import { useCurrentUser } from "../lib/auth";
import {
  GET_SCORING_RULES,
  GET_VALIDATION_CONFIG,
  UPDATE_SCORING_RULE,
  TOGGLE_SCORING_RULE,
  UPDATE_VALIDATION_THRESHOLD,
  RESET_SCORING_RULES_TO_DEFAULT,
  GET_RULE_CONFIG_HISTORY,
} from "../graphql/scoringRules";

const ITEMS_PER_PAGE = 10;

export default function ScoringRulesPage() {
  const { user } = useCurrentUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingWeights, setEditingWeights] = useState<
    Record<string, number>
  >({});
  const [threshold, setThreshold] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // All hooks must be called before any conditional returns
  const { data: rulesData, loading: rulesLoading, refetch: refetchRules } =
    useQuery(GET_SCORING_RULES, {
      skip: !user || user.role !== "ADMIN",
    });
  const { data: configData, loading: configLoading, refetch: refetchConfig } =
    useQuery(GET_VALIDATION_CONFIG, {
      skip: !user || user.role !== "ADMIN",
    });
  const { data: historyData, loading: historyLoading } = useQuery(
    GET_RULE_CONFIG_HISTORY,
    {
      variables: {
        pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
      },
      skip: !showHistory || !user || user.role !== "ADMIN",
    },
  );

  const [updateRule] = useMutation(UPDATE_SCORING_RULE);
  const [toggleRule] = useMutation(TOGGLE_SCORING_RULE);
  const [updateThreshold] = useMutation(UPDATE_VALIDATION_THRESHOLD);
  const [resetRules] = useMutation(RESET_SCORING_RULES_TO_DEFAULT);

  // Redirect if not admin
  if (user && user.role !== "ADMIN") {
    return (
      <DashboardLayout title="Scoring Rules">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-red-600">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
        </div>
      </DashboardLayout>
    );
  }

  const rules = rulesData?.getScoringRules || [];
  const validationConfig = configData?.getValidationConfig;

  if (validationConfig && threshold === null) {
    setThreshold(validationConfig.threshold);
  }

  const handleWeightChange = (attribute: string, value: number) => {
    setEditingWeights({ ...editingWeights, [attribute]: value });
  };

  const handleWeightSave = async (attribute: string) => {
    const weight = editingWeights[attribute];
    if (weight === undefined) return;

    try {
      await updateRule({
        variables: {
          input: {
            attribute,
            weight,
          },
        },
      });
      delete editingWeights[attribute];
      await refetchRules();
    } catch (e) {
      console.error("Error updating rule:", e);
      alert("Gagal memperbarui aturan. Silakan coba lagi.");
    }
  };

  const handleToggleActive = async (attribute: string, isActive: boolean) => {
    try {
      await toggleRule({
        variables: {
          attribute,
          isActive: !isActive,
        },
      });
      await refetchRules();
    } catch (e) {
      console.error("Error toggling rule:", e);
      alert("Gagal mengubah status aturan. Silakan coba lagi.");
    }
  };

  const handleThresholdUpdate = async () => {
    if (threshold === null) return;

    try {
      await updateThreshold({
        variables: { threshold },
      });
      await refetchConfig();
      alert("Threshold berhasil diperbarui.");
    } catch (e) {
      console.error("Error updating threshold:", e);
      alert("Gagal memperbarui threshold. Silakan coba lagi.");
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mengembalikan semua aturan ke nilai default?",
      )
    ) {
      return;
    }

    try {
      await resetRules();
      await refetchRules();
      await refetchConfig();
      alert("Aturan berhasil direset ke nilai default.");
    } catch (e) {
      console.error("Error resetting rules:", e);
      alert("Gagal mereset aturan. Silakan coba lagi.");
    }
  };

  const historyEdges = historyData?.getRuleConfigHistory?.edges || [];
  const historyTotalCount = historyData?.getRuleConfigHistory?.totalCount || 0;
  const historyTotalPages = Math.ceil(historyTotalCount / ITEMS_PER_PAGE);

  return (
    <DashboardLayout title="Scoring Rules & Validation Config">
      <div className="space-y-6">
        {/* Validation Threshold Section */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Validation Threshold</h2>
          {configLoading ? (
            <p className="text-gray-500">Memuat...</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Threshold: {threshold ?? validationConfig?.threshold ?? 0}
              </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={threshold ?? validationConfig?.threshold ?? 0}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={handleThresholdUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update Threshold
              </button>
            </div>
          )}
          {validationConfig && (
            <p className="text-sm text-gray-700 mt-2">
              Terakhir diperbarui oleh {validationConfig.updatedBy.name} pada{" "}
              {new Date(validationConfig.updatedAt).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Scoring Rules Table */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Scoring Rules</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Reset to Default
            </button>
          </div>

          {rulesLoading ? (
            <p className="text-gray-500">Memuat aturan...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                    <th className="py-3 px-4 text-left">Attribute</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-left">Criteria</th>
                    <th className="py-3 px-4 text-center">Weight</th>
                    <th className="py-3 px-4 text-center">Active</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {rules.map((rule: {
                    _id: string;
                    attribute: string;
                    description: string;
                    criteria: string;
                    weight: number;
                    isActive: boolean;
                    updatedAt: string;
                  }) => (
                    <tr
                      key={rule._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium">{rule.attribute}</td>
                      <td className="py-3 px-4">{rule.description}</td>
                      <td className="py-3 px-4">{rule.criteria}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={
                              editingWeights[rule.attribute] ?? rule.weight
                            }
                            onChange={(e) =>
                              handleWeightChange(
                                rule.attribute,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                          />
                          {editingWeights[rule.attribute] !== undefined && (
                            <button
                              onClick={() => handleWeightSave(rule.attribute)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.isActive}
                            onChange={() =>
                              handleToggleActive(rule.attribute, rule.isActive)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs text-gray-500">
                          Updated: {new Date(rule.updatedAt).toLocaleDateString("id-ID")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Config History */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Configuration History</h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              {showHistory ? "Hide" : "Show"} History
            </button>
          </div>

          {showHistory && (
            <>
              {historyLoading ? (
                <p className="text-gray-500">Memuat riwayat...</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                          <th className="py-3 px-4 text-left">Type</th>
                          <th className="py-3 px-4 text-left">Attribute</th>
                          <th className="py-3 px-4 text-left">Changes</th>
                          <th className="py-3 px-4 text-left">Changed By</th>
                          <th className="py-3 px-4 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm">
                        {historyEdges.map((edge: {
                          node: {
                            _id: string;
                            type: string;
                            attribute?: string;
                            changes: unknown;
                            changedBy: { name: string };
                            changedAt: string;
                          };
                        }) => {
                          const node = edge.node;
                          return (
                            <tr
                              key={node._id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">{node.type}</td>
                              <td className="py-3 px-4">
                                {node.attribute || "-"}
                              </td>
                              <td className="py-3 px-4">
                                <pre className="text-xs">
                                  {JSON.stringify(node.changes, null, 2)}
                                </pre>
                              </td>
                              <td className="py-3 px-4">
                                {node.changedBy.name}
                              </td>
                              <td className="py-3 px-4">
                                {new Date(node.changedAt).toLocaleString("id-ID")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {historyTotalPages > 1 && (
                    <div className="flex justify-center items-center mt-4 gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {historyTotalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(historyTotalPages, currentPage + 1),
                          )
                        }
                        disabled={currentPage === historyTotalPages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}



