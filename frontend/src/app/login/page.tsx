"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem(
        "token",
        response.data.token
      );

      router.push("/workflows");
    } catch (error) {
      console.error(error);

      alert("login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[400px] border rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">
          FlowForge Login
        </h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}