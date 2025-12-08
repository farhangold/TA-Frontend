"use client";

import Link from "next/link";
import {
  ChartBarIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-5 h-5"
                >
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UAT Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors rounded-xl hover:bg-gray-100"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Kelola Laporan UAT
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dengan Mudah
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Sistem manajemen laporan User Acceptance Testing yang efisien dengan
            validasi otomatis dan dashboard analitik yang informatif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Mulai Sekarang
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <DocumentCheckIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Kelola Laporan
            </h3>
            <p className="text-gray-600">
              Buat, edit, dan kelola laporan UAT dengan antarmuka yang intuitif
              dan mudah digunakan.
            </p>
          </div>

          <div className="bg-white bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Validasi Otomatis
            </h3>
            <p className="text-gray-600">
              Sistem validasi otomatis yang cepat dan akurat untuk mengevaluasi
              kualitas laporan UAT.
            </p>
          </div>

          <div className="bg-white bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <ChartBarIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard Analitik
            </h3>
            <p className="text-gray-600">
              Dashboard yang informatif dengan grafik dan statistik untuk
              analisis laporan UAT.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 rounded-2xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Siap untuk Memulai?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Daftar sekarang dan mulai kelola laporan UAT Anda dengan lebih
              efisien.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Daftar Gratis
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2024 UAT Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
