"use client";

import { useQuery } from "@apollo/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUpIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import DashboardLayout from "../components/DashboardLayout";
import { GET_UAT_REPORTS, GET_DASHBOARD_STATS } from "../graphql/uatReports";

// Helper function to transform reports into time series data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformReportsToTimeSeries(reports: any[]) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      count: 0,
      name: date.toLocaleDateString("id-ID", { weekday: "short" }),
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports.forEach((report: any) => {
    const reportDate = new Date(report.createdAt)
      .toISOString()
      .split("T")[0];
    const dayIndex = last7Days.findIndex((d) => d.date === reportDate);
    if (dayIndex !== -1) {
      last7Days[dayIndex].count++;
    }
  });

  return last7Days.map((d) => ({ name: d.name, value: d.count }));
}

// Helper function to count reports by status
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countReportsByStatus(reports: any[]) {
  const counts: Record<string, number> = {
    PENDING_EVALUATION: 0,
    EVALUATING: 0,
    VALID: 0,
    INVALID: 0,
    FAILED: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports.forEach((report: any) => {
    counts[report.status] = (counts[report.status] || 0) + 1;
  });

  return [
    {
      name: "Valid",
      value: counts.VALID,
      color: "#00D1E8",
    },
    {
      name: "Invalid",
      value: counts.INVALID + counts.FAILED,
      color: "#FF3B30",
    },
  ];
}

// Helper function to count by severity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countBySeverity(reports: any[]) {
  const counts: Record<string, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports.forEach((report: any) => {
    if (report.severityLevel) {
      counts[report.severityLevel] = (counts[report.severityLevel] || 0) + 1;
    }
  });

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color:
      name === "CRITICAL"
        ? "#FF3B30"
        : name === "HIGH"
          ? "#FF9500"
          : name === "MEDIUM"
            ? "#FFCC00"
            : "#4CD964",
  }));
}

export default function Dashboard() {
  // Fetch dashboard stats (aggregated counts from all reports)
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery(GET_DASHBOARD_STATS, {
    fetchPolicy: "cache-and-network",
  });

  // Fetch recent reports (max 100 per page due to backend limit) for time series chart
  const {
    data: reportsData,
    loading: reportsLoading,
    error: reportsError,
  } = useQuery(GET_UAT_REPORTS, {
    variables: {
      filter: undefined,
      sort: undefined, // Explicitly set to undefined to avoid validation errors
      pagination: { page: 1, limit: 100 }, // Backend max limit is 100
    },
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData?.getDashboardStats;
  const reports = reportsData?.getUATReports?.edges?.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (edge: any) => edge.node,
  ) || [];
  const totalCount = stats?.totalReports ?? reportsData?.getUATReports?.totalCount ?? 0;

  // Transform data for charts
  const areaData = transformReportsToTimeSeries(reports);
  const validInvalidData = stats ? [
    {
      name: "Valid",
      value: stats.validReports,
      color: "#00D1E8",
    },
    {
      name: "Invalid",
      value: stats.invalidReports,
      color: "#FF3B30",
    },
  ] : countReportsByStatus(reports);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _severityData = countBySeverity(reports); // Reserved for future use

  // Use stats data for verification and success data
  const verificationData = stats ? [
    { name: "Sedang Diverifikasi", value: stats.verifyingReports, color: "#FF00C7" },
    { name: "Laporan Baru", value: stats.newReports, color: "#FFAAF0" },
  ] : [
    { name: "Sedang Diverifikasi", value: 0, color: "#FF00C7" },
    { name: "Laporan Baru", value: 0, color: "#FFAAF0" },
  ];

  const successData = stats ? [
    { name: "Validasi Sukses", value: stats.validReports, color: "#4CD964" },
    { name: "Laporan Baru", value: stats.newReports, color: "#B8FFD0" },
  ] : [
    { name: "Validasi Sukses", value: 0, color: "#4CD964" },
    { name: "Laporan Baru", value: 0, color: "#B8FFD0" },
  ];

  // Custom tooltip for area chart
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600">{`Laporan: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (reportsLoading || statsLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-gray-500">Memuat data dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (reportsError || statsError) {
    const error = reportsError || statsError;
    console.error("Dashboard error details:", error);
    return (
      <DashboardLayout title="Dashboard">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold mb-2">Error memuat data dashboard</p>
            <p className="text-sm text-red-600">
              {error?.message || "Terjadi kesalahan saat memuat data. Silakan refresh halaman."}
            </p>
            {error?.graphQLErrors && error.graphQLErrors.length > 0 && (
              <div className="mt-2 text-xs text-red-500">
                {error.graphQLErrors.map((err: { message?: string; extensions?: Record<string, unknown> }, idx: number) => (
                  <div key={idx}>
                    {err.message || "Unknown error"}
                    {err.extensions && <span>{JSON.stringify(err.extensions)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate change from previous period (simplified - compare last 7 days vs previous 7 days)
  const last7DaysCount = areaData.reduce((sum, d) => sum + d.value, 0);
  const previous7DaysCount = Math.max(0, totalCount - last7DaysCount);
  const change = last7DaysCount - previous7DaysCount;

  return (
    <DashboardLayout title="Dashboard">
      {/* Total Laporan UAT */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg text-gray-600 font-semibold">Total Laporan UAT</h2>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-500">{totalCount}</div>
            <div className="flex items-center justify-end text-sm text-gray-500">
              <span>Total laporan</span>
              {change !== 0 && (
                <span
                  className={`ml-2 flex items-center ${
                    change > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <ArrowUpIcon
                    className={`w-4 h-4 mr-1 ${
                      change < 0 ? "rotate-180" : ""
                    }`}
                  />
                  {Math.abs(change)}
              </span>
              )}
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={areaData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1890FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1890FF"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Card 1 - Laporan Valid & Invalid */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg  text-gray-600 font-medium">Laporan Valid & Invalid</h3>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={validInvalidData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {validInvalidData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x="50%"
                      dy="-0.5em"
                      className="text-sm text-gray-500"
                      fontSize="12"
                    >
                      Total
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.6em"
                      className="font-bold"
                      fontSize="18"
                    >
                      {stats ? stats.validReports + stats.invalidReports : validInvalidData.reduce((sum, d) => sum + d.value, 0)}
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full bg-cyan-400 mr-2"
                style={{ backgroundColor: "#00D1E8" }}
              ></div>
              <span className="text-sm text-gray-600">Total Laporan Valid</span>
              <span className="ml-auto text-gray-600 font-medium">{stats?.validReports ?? validInvalidData[0]?.value ?? 0}</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full bg-red-500 mr-2"
                style={{ backgroundColor: "#FF3B30" }}
              ></div>
              <span className="text-sm text-gray-600">Total Laporan Invalid</span>
              <span className="ml-auto text-gray-600 font-medium">{stats?.invalidReports ?? validInvalidData[1]?.value ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Card 2 - Laporan Sedang Diverifikasi */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-gray-600 font-medium">Laporan Sedang Diverifikasi</h3>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {verificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x="50%"
                      dy="-0.5em"
                      className="text-sm text-gray-500"
                      fontSize="12"
                    >
                      Total
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.6em"
                      className="font-bold"
                      fontSize="18"
                    >
                      {stats?.verifyingReports ?? verificationData.reduce((sum, d) => sum + d.value, 0)}
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: "#FF00C7" }}
              ></div>
              <span className="text-sm text-gray-600">Total Laporan Sedang Diverifikasi</span>
              <span className="ml-auto text-gray-600 font-medium">{stats ? stats.evaluatingReports + stats.pendingReports : verificationData[0]?.value ?? 0}</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: "#FFAAF0" }}
              ></div>
              <span className="text-sm text-gray-600">Laporan Baru</span>
              <span className="ml-auto font-medium flex items-center text-green-500">
                <ArrowUpIcon className="w-3 h-3 mr-1" />
                {stats?.newReports ?? verificationData[1]?.value ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 - Presentase Validasi Sukses */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-gray-600 font-medium">Presentase Validasi Sukses</h3>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {successData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x="50%"
                      dy="-0.5em"
                      className="text-sm text-gray-500"
                      fontSize="12"
                    >
                      Total
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.6em"
                      className="font-bold"
                      fontSize="18"
                    >
                      {stats ? stats.validReports + stats.newReports : successData.reduce((sum, d) => sum + d.value, 0)}
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: "#4CD964" }}
              ></div>
              <span className="text-sm text-gray-600">Total Laporan Validasi Sukses</span>
              <span className="ml-auto text-gray-600 font-medium">{stats?.validReports ?? successData[0]?.value ?? 0}</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: "#B8FFD0" }}
              ></div>
              <span className="text-sm text-gray-600">Laporan Baru</span>
              <span className="ml-auto font-medium flex items-center text-green-500">
                <ArrowUpIcon className="w-3 h-3 mr-1" />{stats?.newReports ?? successData[1]?.value ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
