"use client";

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

export default function Dashboard() {
  // Mock data for the area chart
  const areaData = [
    { name: "Senin", value: 150 },
    { name: "Selasa", value: 230 },
    { name: "Rabu", value: 224 },
    { name: "Kamis", value: 218 },
    { name: "Jumat", value: 135 },
    { name: "Sabtu", value: 147 },
    { name: "Minggu", value: 260 },
  ];

  // Pie chart data
  const validInvalidData = [
    { name: "Valid", value: 5, color: "#00D1E8" },
    { name: "Invalid", value: 5, color: "#FF3B30" },
  ];

  const verificationData = [
    { name: "Sedang Diverifikasi", value: 22, color: "#FF00C7" },
    { name: "Laporan Baru", value: 10, color: "#FFAAF0" },
  ];

  const successData = [
    { name: "Validasi Sukses", value: 18, color: "#4CD964" },
    { name: "Laporan Baru", value: 4, color: "#B8FFD0" },
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

  return (
    <DashboardLayout title="Dashboard">
      {/* Total Laporan UAT */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg text-gray-600 font-semibold">Total Laporan UAT</h2>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-500">245</div>
            <div className="flex items-center justify-end text-sm text-gray-500">
              <span>Dari hari minggu</span>
              <span className="ml-2 flex items-center text-green-500">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                23
              </span>
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
                      10
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
              <span className="ml-auto text-gray-600 font-medium">5</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full bg-red-500 mr-2"
                style={{ backgroundColor: "#FF3B30" }}
              ></div>
              <span className="text-sm text-gray-600">Total Laporan Invalid</span>
              <span className="ml-auto text-gray-600 font-medium">5</span>
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
                      32
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
              <span className="ml-auto text-gray-600 font-medium">22</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: "#FFAAF0" }}
              ></div>
              <span className="text-sm text-gray-600">Laporan Baru</span>
              <span className="ml-auto font-medium flex items-center text-green-500">
                <ArrowUpIcon className="w-3 h-3 mr-1" />
                10
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
                      22
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
              <span className="ml-auto text-gray-600 font-medium">18</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: "#B8FFD0" }}
              ></div>
              <span className="text-sm text-gray-600">Laporan Baru</span>
              <span className="ml-auto font-medium flex items-center text-green-500">
                <ArrowUpIcon className="w-3 h-3 mr-1" />5
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
