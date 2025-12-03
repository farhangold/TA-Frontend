"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import { useCurrentUser } from "../lib/auth";
import { UPDATE_USER } from "../graphql/users";

export default function PengaturanPage() {
  const { user, loading, refetchUser } = useCurrentUser();
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const [updateUser] = useMutation(UPDATE_USER);

  React.useEffect(() => {
    if (user?.name) {
      setNameValue(user.name);
    }
  }, [user?.name]);

  const handleSaveName = async () => {
    if (!user?._id || !nameValue.trim()) {
      alert("Nama tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({
        variables: {
          id: user._id,
          input: {
            name: nameValue.trim(),
          },
        },
      });
      await refetchUser();
      setEditName(false);
      alert("Nama berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating name:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal memperbarui nama. Silakan coba lagi.";
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNameValue(user?.name || "");
    setEditName(false);
  };

  if (loading && !user) {
    return (
      <DashboardLayout title="Pengaturan">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-gray-500">Memuat profil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pengaturan">
      <div className="space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Informasi Profil
          </h2>

          <div className="space-y-4">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email tidak dapat diubah.
              </p>
            </div>

            {/* Name (Editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama
              </label>
              {editName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving || !nameValue.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-100 cursor-not-allowed"
                  />
                  <button
                    onClick={() => setEditName(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={user?.role || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Role ditentukan oleh administrator.
              </p>
            </div>

            {/* Account Created Date */}
            {user?.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Bergabung
                </label>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pengaturan Lainnya
          </h2>
          <p className="text-gray-600 text-sm">
            Fitur pengaturan tambahan akan tersedia segera.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

