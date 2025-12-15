"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import DashboardLayout from "../components/DashboardLayout";
import Button from "../components/Button";
import { useCurrentUser } from "../lib/auth";
import { GET_USERS, REGISTER_USER, UPDATE_USER } from "../graphql/users";

const ITEMS_PER_PAGE = 10;

type UserNode = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function UsersPage() {
  const { user } = useCurrentUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserNode | null>(null);

  const filter = filterRole ? { role: filterRole } : undefined;

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: {
      filter,
      pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
    },
    fetchPolicy: "cache-and-network",
    skip: !user || user.role !== "ADMIN",
  });

  const [registerUser] = useMutation(REGISTER_USER);
  const [updateUser] = useMutation(UPDATE_USER);

  // Redirect if not admin
  if (user && user.role !== "ADMIN") {
    return (
      <DashboardLayout title="User Management">
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-red-600">
            Akses ditolak. Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = data?.users?.edges?.map((edge: any) => edge.node) || [];
  const totalCount = data?.users?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Filter by search term (client-side for name/email)
  const filteredUsers = users.filter(
    (u: UserNode) =>
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateUser = async (formData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    try {
      await registerUser({
        variables: {
          input: formData,
        },
      });
      setShowCreateModal(false);
      await refetch();
    } catch (e: unknown) {
      console.error("Error creating user:", e);
      const errorMessage = e instanceof Error ? e.message : "Gagal membuat pengguna. Silakan coba lagi.";
      alert(errorMessage);
    }
  };

  const handleUpdateUser = async (id: string, formData: {
    name?: string;
    password?: string;
    role?: string;
  }) => {
    try {
      await updateUser({
        variables: {
          id,
          input: formData,
        },
      });
      setShowEditModal(false);
      setSelectedUser(null);
      await refetch();
    } catch (e: unknown) {
      console.error("Error updating user:", e);
      const errorMessage = e instanceof Error ? e.message : "Gagal memperbarui pengguna. Silakan coba lagi.";
      alert(errorMessage);
    }
  };

  const handleEdit = (userData: UserNode) => {
    setSelectedUser(userData);
    setShowEditModal(true);
  };

  return (
    <DashboardLayout title="User Management">
      <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg w-64 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <Button
              type="button"
              onClick={() => setShowCreateModal(true)}
              size="sm"
              variant="primary"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + Tambah Pengguna
            </Button>
          </div>
        </div>

        {loading && (
          <div className="py-8 text-center text-sm text-gray-500">
            Memuat pengguna...
          </div>
        )}

        {error && !loading && (
          <div className="py-8 text-center text-sm text-red-600">
            Gagal memuat data pengguna.
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                    <th className="py-3 px-4 text-left">Nama</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-center">Role</th>
                    <th className="py-3 px-4 text-center">Tanggal Dibuat</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {filteredUsers.map((u: UserNode) => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            u.role === "ADMIN"
                              ? "bg-purple-300 text-purple-800"
                              : u.role === "REVIEWER"
                                ? "bg-blue-300 text-blue-800"
                                : "bg-gray-300 text-gray-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          type="button"
                          onClick={() => handleEdit(u)}
                          size="sm"
                          variant="primary"
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-sm text-gray-500"
                      >
                        Tidak ada pengguna yang ditemukan.
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
                  <Button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    size="sm"
                    variant="outline"
                    className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    size="sm"
                    variant="outline"
                    className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
        />
      )}
    </DashboardLayout>
  );
}

function CreateUserModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => void;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "REVIEWER",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Tambah Pengguna</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nama
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              onClick={onClose}
              size="sm"
              variant="outline"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSubmit,
}: {
  user: UserNode;
  onClose: () => void;
  onSubmit: (id: string, data: {
    name?: string;
    password?: string;
    role?: string;
  }) => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    password: "",
    role: user.role,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: {
      name?: string;
      password?: string;
      role?: string;
    } = {
      name: formData.name,
      role: formData.role,
    };
    if (formData.password) {
      updateData.password = formData.password;
    }
    onSubmit(user._id, updateData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Pengguna</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nama
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Password Baru (kosongkan jika tidak ingin mengubah)
            </label>
            <input
              type="password"
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              onClick={onClose}
              size="sm"
              variant="outline"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



