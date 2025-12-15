"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { PUBLIC_REGISTER_MUTATION } from "../graphql/auth";
import { useAuth, type AuthPayload } from "../lib/auth";
import Button from "../components/Button";

const RegisterPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [mutate, { loading }] = useMutation(PUBLIC_REGISTER_MUTATION);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Nama harus diisi";
    }

    if (!formData.email.trim()) {
      errors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      errors.password = "Password harus diisi";
    } else if (formData.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await mutate({
        variables: {
          input: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
          },
        },
      });

      if (data?.publicRegister) {
        await login(data.publicRegister as AuthPayload);
        router.push("/dashboard");
      } else {
        setFormError("Registrasi gagal, silakan coba lagi.");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage =
        (error as { graphQLErrors?: Array<{ message?: string }>; message?: string })?.graphQLErrors?.[0]?.message ||
        (error as { message?: string })?.message ||
        "Email sudah terdaftar atau terjadi kesalahan.";
      setFormError(errorMessage);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Selamat Datang!
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Daftar sekarang untuk mulai mengelola laporan UAT dan hasil
              validasi dengan mudah.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-200 group-hover:scale-110">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-200">Kelola laporan UAT dengan mudah</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-200 group-hover:scale-110">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-200">Validasi otomatis dan cepat</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-200 group-hover:scale-110">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-200">Dashboard analitik yang informatif</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Buat Akun Baru
            </h1>
            <p className="text-gray-700">
              Daftar untuk mulai menggunakan sistem UAT.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon
                    className={`h-5 w-5 ${
                      fieldErrors.name
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.name
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon
                    className={`h-5 w-5 ${
                      fieldErrors.email
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.email
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  }`}
                  placeholder="nama@perusahaan.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon
                    className={`h-5 w-5 ${
                      fieldErrors.password
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.password
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  }`}
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-900 mb-1.5"
              >
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon
                    className={`h-5 w-5 ${
                      fieldErrors.confirmPassword
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.confirmPassword
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  }`}
                  placeholder="Ulangi kata sandi"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Form Error */}
            {formError && (
              <div
                className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md animate-in fade-in duration-300"
                role="alert"
              >
                <p className="text-sm font-medium text-red-600">{formError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-6"
            >
              Daftar
            </Button>
          </form>

          {/* Link to Login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-700">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Masuk
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

