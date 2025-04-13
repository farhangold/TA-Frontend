"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally handle authentication
    // But for now, we'll just navigate to the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left side - Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="/frame 19.png"
          alt="Login background"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-16 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2">Selamat Datang!</h1>
            <p className="text-gray-600">
              Masuk sekarang dan kelola laporan dengan mudah.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-gray-800 font-medium mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Masukkan Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-800 font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  placeholder="Minimal 8 huruf dengan simbol unik"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Toggle password visibility"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-700"
                >
                  Ingatkan saya
                </label>
              </div>
              <a href="#" className="text-sm text-gray-700 hover:text-blue-600">
                Lupa password
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 text-white font-medium rounded-lg transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800"
              style={{ backgroundColor: "#2E62EA" }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
