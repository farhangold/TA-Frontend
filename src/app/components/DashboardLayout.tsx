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
    <div className="flex min-h-screen text-gray-600 bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 ml-[150px] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-blue-50">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex items-center">
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">
                <span>{getUserInitials()}</span>
              </div>
              <div className="ml-2">
                <div className="text-sm text-gray-600 font-medium">
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
