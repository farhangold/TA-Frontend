"use client";

import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useAuth } from "../lib/auth";
import { LOGOUT_MUTATION } from "../graphql/auth";

const LogoutPage = () => {
  const { logout } = useAuth();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call backend logout mutation first
        await logoutMutation();
      } catch (error) {
        // Continue with local logout even if backend call fails
        console.error("Backend logout failed:", error);
      } finally {
        // Always perform local logout
        await logout();
      }
    };

    void performLogout();
  }, [logout, logoutMutation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-600">Sedang keluar...</p>
    </div>
  );
};

export default LogoutPage;


