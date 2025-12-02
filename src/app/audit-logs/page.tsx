"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import { useCurrentUser } from "../lib/auth";
import { GET_AUDIT_LOGS } from "../graphql/auditLogs";

const ITEMS_PER_PAGE = 20;

export default function AuditLogsPage() {
  const { user } = useCurrentUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAction, setFilterAction] = useState<string[]>([]);
  const [filterEntity, setFilterEntity] = useState<string[]>([]);
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filter = useMemo(() => {
    const f: Record<string, unknown> = {};
    if (filterAction.length > 0) {
      f.action = filterAction;
    }
    if (filterEntity.length > 0) {
      f.entity = filterEntity;
    }
    if (filterUserId) {
      f.userId = filterUserId;
    }
    if (dateFrom || dateTo) {
      f.dateRange = {
        from: dateFrom || new Date(0).toISOString(),
        to: dateTo || new Date().toISOString(),
      };
    }
    return Object.keys(f).length > 0 ? f : undefined;
  }, [filterAction, filterEntity, filterUserId, dateFrom, dateTo]);

  const { data, loading, error } = useQuery(GET_AUDIT_LOGS, {
    variables: {
      filter,
      pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
    },
    fetchPolicy: "cache-and-network",
    skip: !user || user.role !== "ADMIN",
  });

  // Redirect if not admin
  if (user && user.role !== "ADMIN") {
    return (
      <DashboardLayout title="Audit Logs">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-red-600">
            Akses ditolak. Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs = data?.getAuditLogs?.edges?.map((edge: any) => edge.node) || [];
  const totalCount = data?.getAuditLogs?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const handleActionToggle = (action: string) => {
    setFilterAction((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action],
    );
    setCurrentPage(1);
  };

  const handleEntityToggle = (entity: string) => {
    setFilterEntity((prev) =>
      prev.includes(entity)
        ? prev.filter((e) => e !== entity)
        : [...prev, entity],
    );
    setCurrentPage(1);
  };

  return (
    <DashboardLayout title="Audit Logs">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <div className="space-y-1">
                {[
                  "CREATE",
                  "UPDATE",
                  "DELETE",
                  "EVALUATE",
                  "EXPORT",
                  "LOGIN",
                  "LOGOUT",
                  "CONFIG_CHANGE",
                ].map((action) => (
                  <label key={action} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterAction.includes(action)}
                      onChange={() => handleActionToggle(action)}
                      className="mr-2"
                    />
                    <span className="text-sm">{action}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Entity
              </label>
              <div className="space-y-1">
                {[
                  "UAT_REPORT",
                  "EVALUATION",
                  "SCORING_RULE",
                  "VALIDATION_CONFIG",
                  "USER",
                ].map((entity) => (
                  <label key={entity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterEntity.includes(entity)}
                      onChange={() => handleEntityToggle(entity)}
                      className="mr-2"
                    />
                    <span className="text-sm">{entity}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Date Range
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-gray-900"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <button
                onClick={() => {
                  setFilterAction([]);
                  setFilterEntity([]);
                  setFilterUserId("");
                  setDateFrom("");
                  setDateTo("");
                  setCurrentPage(1);
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-8 text-center text-sm text-gray-500">
            Memuat audit logs...
          </div>
        )}

        {error && !loading && (
          <div className="py-8 text-center text-sm text-red-600">
            Gagal memuat audit logs.
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                    <th className="py-3 px-4 text-left">Timestamp</th>
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Action</th>
                    <th className="py-3 px-4 text-left">Entity</th>
                    <th className="py-3 px-4 text-left">Entity ID</th>
                    <th className="py-3 px-4 text-left">Changes</th>
                    <th className="py-3 px-4 text-left">IP Address</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {logs.map((log: any) => (
                    <tr
                      key={log._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        {new Date(log.timestamp).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        {log.user?.name || log.user?.email || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {log.entity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {log.entityId}
                      </td>
                      <td className="py-3 px-4">
                        {log.changes ? (
                          <pre className="text-xs max-w-xs overflow-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-sm text-gray-500"
                      >
                        Tidak ada audit log yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 text-sm">
                <div className="text-gray-600">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                  {totalCount} result
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}



