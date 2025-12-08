// src/components/DashboardLayout.tsx
"use client";

import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useCurrentUser } from "../lib/auth";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { user } = useCurrentUser();

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[200px] sm:ml-[180px] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <div className="flex items-center">
            <div className="ml-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white ring-2 ring-blue-200 shadow-md">
                <span className="text-sm font-semibold">{getUserInitials()}</span>
              </div>
              <div>
                <div className="text-sm text-gray-800 font-semibold">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || "Unknown"}
                </div>
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
