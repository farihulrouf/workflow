"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      router.push("/workflows");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        "Invalid credentials";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            FlowForge
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Login to continue
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-3 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}