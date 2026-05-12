"use client";

import Link from "next/link";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { jwtDecode } from "jwt-decode";

import {
  LayoutDashboard,
  Workflow,
  Activity,
  LogOut,
} from "lucide-react";

interface Props {
  children: ReactNode;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  username?: string;
}

export default function DashboardLayout({
  children,
}: Props) {

  const pathname = usePathname();

  const [email, setEmail] =
    useState("Unknown User");

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) return;

    try {

      const decoded =
        jwtDecode<JwtPayload>(token);

      console.log(decoded);

      if (decoded.email) {

        setEmail(decoded.email);

      } else if (decoded.sub) {

        setEmail(decoded.sub);

      } else if (decoded.username) {

        setEmail(decoded.username);
      }

    } catch (err) {

      console.error(
        "JWT decode error:",
        err,
      );
    }

  }, []);

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc] flex">

      {/* SIDEBAR */}
      <aside
        className="
          w-72
          bg-white/90
          backdrop-blur
          border-r
          border-blue-100
          hidden
          md:flex
          flex-col
          shadow-sm
        "
      >

        {/* LOGO */}
        <div className="px-8 py-8 border-b border-blue-50">

          <h1
            className="
              text-3xl
              font-black
              tracking-tight
              text-blue-700
            "
          >
            FlowForge
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Workflow Engine
          </p>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-5 py-6 space-y-2">

          <Link
            href="/dashboard"
            className={`
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-2xl
              transition-all

              ${
                pathname === "/dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }
            `}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            href="/workflows"
            className={`
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-2xl
              transition-all

              ${
                pathname.startsWith("/workflows")
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }
            `}
          >
            <Workflow size={20} />
            Workflows
          </Link>

          <Link
            href="/runs"
            className={`
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-2xl
              transition-all

              ${
                pathname.startsWith("/runs")
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }
            `}
          >
            <Activity size={20} />
            Runs
          </Link>

        </nav>

        {/* USER INFO */}
        <div className="p-5 border-t border-blue-50">

          <div
            className="
              bg-blue-50
              rounded-2xl
              p-4
              mb-4
              border
              border-blue-100
            "
          >

            <p className="text-sm text-gray-500">
              Logged in as
            </p>

            <p className="font-semibold text-blue-700 break-all">
              {email}
            </p>

          </div>

          <button
            onClick={() => {

              localStorage.removeItem(
                "token",
              );

              window.location.href =
                "/login";
            }}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              bg-red-500
              hover:bg-red-600
              text-white
              py-3
              rounded-2xl
              transition-all
              shadow-sm
            "
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header
          className="
            h-20
            bg-white/80
            backdrop-blur
            border-b
            border-blue-100
            px-8
            flex
            items-center
            justify-between
            sticky
            top-0
            z-50
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-bold
                text-gray-800
              "
            >
              FlowForge Dashboard
            </h2>

            <p className="text-sm text-gray-400">
              Multi Tenant Workflow Engine
            </p>

          </div>

          <div
            className="
              bg-blue-50
              text-blue-700
              px-4
              py-2
              rounded-2xl
              text-sm
              font-medium
              border
              border-blue-100
            "
          >
            Realtime Monitoring
          </div>

        </header>

        {/* CONTENT */}
        <div className="p-8">
          {children}
        </div>

      </main>

    </div>
  );
}