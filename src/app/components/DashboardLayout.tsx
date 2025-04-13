// src/components/DashboardLayout.tsx
import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen text-gray-600 bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 ml-[150px] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-blue-50">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari"
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">
                <span>KL</span>
              </div>
              <div className="ml-2">
                <div className="text-sm text-gray-600 font-medium">Kang Liu</div>
                <div className="text-xs text-gray-500">Manager</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
