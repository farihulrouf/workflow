"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import api from "@/lib/api";

import {
  Activity,
  CheckCircle2,
  XCircle,
  Timer,
  Workflow,
  TrendingUp,
} from "lucide-react";

// ======================================
// TYPES
// ======================================

interface Metrics {
  active_runs: number;

  success_runs: number;

  failed_runs: number;

  average_duration_seconds: number;
}

interface WorkflowRun {
  ID: number;

  WorkflowID: number;

  Status: string;

  StartedAt: number;

  EndedAt: number;

  CreatedAt: string;
}

// ======================================
// PAGE
// ======================================

export default function DashboardPage() {
  // ======================================
  // STATES
  // ======================================

  const [metrics, setMetrics] =
    useState<Metrics | null>(null);

  const [runs, setRuns] = useState<
    WorkflowRun[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  // ======================================
  // FETCH DASHBOARD
  // ======================================

  const fetchDashboard =
    async () => {
      try {
        const [
          metricsResponse,
          runsResponse,
        ] = await Promise.all([
          api.get("/health/metrics"),

          api.get(
            "/workflow-runs?page=1&limit=6"
          ),
        ]);

        setMetrics(
          metricsResponse.data
        );

        setRuns(
          runsResponse.data.data
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  // ======================================
  // SUCCESS RATE
  // ======================================

  const totalRuns =
    (metrics?.success_runs || 0) +
    (metrics?.failed_runs || 0);

  const successRate =
    totalRuns === 0
      ? 0
      : Math.round(
          ((metrics?.success_runs || 0) /
            totalRuns) *
            100
        );

  // ======================================
  // RENDER
  // ======================================

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ====================================== */}
        {/* HERO */}
        {/* ====================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[40px]
            bg-gradient-to-br
            from-blue-600
            via-blue-500
            to-sky-400
            p-10
            text-white
            shadow-2xl
            shadow-blue-100
          "
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div
              className="
                inline-flex
                items-center
                gap-2
                bg-white/15
                px-4
                py-2
                rounded-2xl
                backdrop-blur-sm
                border
                border-white/10
                mb-6
              "
            >
              <Workflow size={18} />

              <span className="text-sm font-medium">
                Realtime Workflow Engine
              </span>
            </div>

            <h1 className="text-5xl font-black leading-tight">
              FlowForge System Dashboard
            </h1>

            <p className="text-blue-100 text-lg mt-5 max-w-3xl">
              Monitor workflow orchestration,
              execution metrics, realtime DAG
              processing, and system health
              across all tenant workloads.
            </p>
          </div>
        </div>

        {/* ====================================== */}
        {/* METRICS */}
        {/* ====================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* ACTIVE RUNS */}
          <div
            className="
              bg-white
              rounded-[30px]
              border
              border-blue-100
              p-7
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Active Runs
                </p>

                <h2 className="text-5xl font-black text-blue-700 mt-3">
                  {metrics?.active_runs}
                </h2>
              </div>

              <div
                className="
                  w-16
                  h-16
                  rounded-3xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                "
              >
                <Activity
                  className="text-blue-600"
                  size={30}
                />
              </div>
            </div>
          </div>

          {/* SUCCESS */}
          <div
            className="
              bg-white
              rounded-[30px]
              border
              border-green-100
              p-7
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Successful Runs
                </p>

                <h2 className="text-5xl font-black text-green-600 mt-3">
                  {metrics?.success_runs}
                </h2>
              </div>

              <div
                className="
                  w-16
                  h-16
                  rounded-3xl
                  bg-green-50
                  flex
                  items-center
                  justify-center
                "
              >
                <CheckCircle2
                  className="text-green-600"
                  size={30}
                />
              </div>
            </div>
          </div>

          {/* FAILED */}
          <div
            className="
              bg-white
              rounded-[30px]
              border
              border-red-100
              p-7
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Failed Runs
                </p>

                <h2 className="text-5xl font-black text-red-600 mt-3">
                  {metrics?.failed_runs}
                </h2>
              </div>

              <div
                className="
                  w-16
                  h-16
                  rounded-3xl
                  bg-red-50
                  flex
                  items-center
                  justify-center
                "
              >
                <XCircle
                  className="text-red-600"
                  size={30}
                />
              </div>
            </div>
          </div>

          {/* AVG DURATION */}
          <div
            className="
              bg-white
              rounded-[30px]
              border
              border-yellow-100
              p-7
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Avg Duration
                </p>

                <h2 className="text-5xl font-black text-yellow-600 mt-3">
                  {
                    metrics?.average_duration_seconds
                  }
                  s
                </h2>
              </div>

              <div
                className="
                  w-16
                  h-16
                  rounded-3xl
                  bg-yellow-50
                  flex
                  items-center
                  justify-center
                "
              >
                <Timer
                  className="text-yellow-600"
                  size={30}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* SUCCESS RATE */}
        {/* ====================================== */}

        <div
          className="
            bg-white
            rounded-[32px]
            border
            border-blue-100
            p-8
            shadow-sm
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Workflow Success Rate
              </p>

              <h2 className="text-6xl font-black text-blue-700 mt-3">
                {successRate}%
              </h2>

              <p className="text-gray-500 mt-4">
                Based on successful vs failed
                workflow executions.
              </p>
            </div>

            <div
              className="
                w-24
                h-24
                rounded-[30px]
                bg-blue-50
                flex
                items-center
                justify-center
              "
            >
              <TrendingUp
                className="text-blue-600"
                size={42}
              />
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* RECENT RUNS */}
        {/* ====================================== */}

        <div
          className="
            bg-white
            rounded-[32px]
            border
            border-blue-100
            shadow-sm
            overflow-hidden
          "
        >
          <div className="p-8 border-b border-blue-50">
            <h2 className="text-3xl font-black text-gray-900">
              Recent Workflow Runs
            </h2>

            <p className="text-gray-500 mt-2">
              Latest workflow executions
              across the orchestration engine.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-600">
                    Run ID
                  </th>

                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-600">
                    Workflow
                  </th>

                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-600">
                    Status
                  </th>

                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-600">
                    Duration
                  </th>

                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-600">
                    Started
                  </th>
                </tr>
              </thead>

              <tbody>
                {runs.map((run) => {
                  const duration =
                    run.EndedAt -
                    run.StartedAt;

                  return (
                    <tr
                      key={run.ID}
                      className="
                        border-t
                        border-blue-50
                        hover:bg-slate-50
                        transition
                      "
                    >
                      <td className="px-8 py-6 font-bold text-blue-700">
                        #{run.ID}
                      </td>

                      <td className="px-8 py-6 text-gray-700 font-medium">
                        Workflow{" "}
                        {run.WorkflowID}
                      </td>

                      <td className="px-8 py-6">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-4
                            py-2
                            rounded-2xl
                            text-sm
                            font-bold

                            ${
                              run.Status ===
                              "SUCCESS"
                                ? "bg-green-50 text-green-700"
                                : run.Status ===
                                  "FAILED"
                                ? "bg-red-50 text-red-700"
                                : "bg-blue-50 text-blue-700"
                            }
                          `}
                        >
                          {run.Status}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-gray-700 font-semibold">
                        {duration}s
                      </td>

                      <td className="px-8 py-6 text-gray-500">
                        {new Date(
                          run.CreatedAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}