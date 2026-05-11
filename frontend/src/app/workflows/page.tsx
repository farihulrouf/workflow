"use client";

import Link from "next/link";

import {
  Search,
  Layers3,
  Activity,
  ChevronRight,
  Sparkles,
  Plus,
} from "lucide-react";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import WorkflowCard from "@/components/WorkflowCard";
import WorkflowRealtimeViewer from "@/components/WorkflowRealtimeViewer";

import api from "@/lib/api";

// ======================================================
// TYPES
// ======================================================

interface WorkflowItem {
  ID: number;
  name: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

// ======================================================
// PAGE
// ======================================================

export default function WorkflowsPage() {
  // ======================================================
  // STATES
  // ======================================================

  const [workflows, setWorkflows] =
    useState<WorkflowItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [search, setSearch] =
    useState("");

  // ======================================================
  // FETCH WORKFLOWS
  // ======================================================

  const fetchWorkflows = async (
    page = 1,
    searchValue = ""
  ) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/workflows?page=${page}&search=${searchValue}`
      );

      setWorkflows(response.data.data);

      setMeta(response.data.meta);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // EFFECT
  // ======================================================

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ====================================================== */}
        {/* HERO */}
        {/* ====================================================== */}

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
          {/* BLUR */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            {/* LEFT */}
            <div className="max-w-2xl">
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
                <Sparkles size={18} />

                <span className="text-sm font-medium">
                  Realtime Workflow Engine
                </span>
              </div>

              <h1 className="text-5xl font-black leading-tight">
                FlowForge Dashboard
              </h1>

              <p className="text-blue-100 text-lg mt-5 leading-relaxed">
                Manage distributed workflow execution,
                monitor realtime orchestration,
                observe DAG processing, and track
                live execution logs.
              </p>

              {/* ACTIONS */}
              <div className="flex items-center gap-4 mt-8">
                {/* CREATE */}
                <Link
                  href="/workflows/create"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    bg-white
                    text-blue-700
                    px-6
                    py-3
                    rounded-2xl
                    font-bold
                    hover:bg-blue-50
                    transition-all
                    shadow-lg
                  "
                >
                  <Plus size={20} />

                  Create Workflow
                </Link>

                {/* RUNS */}
                <Link
                  href="/runs"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    bg-white/10
                    border
                    border-white/20
                    backdrop-blur
                    px-6
                    py-3
                    rounded-2xl
                    font-semibold
                    hover:bg-white/20
                    transition-all
                  "
                >
                  <Activity size={18} />

                  View Runs
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                rounded-3xl
                p-6
                min-w-[320px]
                shadow-xl
              "
            >
              <div className="text-sm text-blue-100">
                Active Workspace
              </div>

              <div className="text-3xl font-bold mt-2">
                FlowForge
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Workflows
                  </span>

                  <span className="font-semibold text-lg">
                    {meta.total}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Current Page
                  </span>

                  <span className="font-semibold text-lg">
                    {meta.page}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Status
                  </span>

                  <span className="text-green-300 font-bold">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* SEARCH */}
        {/* ====================================================== */}

        <div
          className="
            bg-white
            rounded-3xl
            border
            border-blue-100
            p-5
            shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-blue-50
                flex
                items-center
                justify-center
              "
            >
              <Search
                size={20}
                className="text-blue-600"
              />
            </div>

            <input
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);

                fetchWorkflows(
                  1,
                  e.target.value
                );
              }}
              className="
                w-full
                outline-none
                text-slate-700
                placeholder:text-gray-400
                text-lg
                bg-transparent
              "
            />
          </div>
        </div>

        {/* ====================================================== */}
        {/* STATS */}
        {/* ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TOTAL */}
          <div
            className="
              bg-white
              rounded-3xl
              border
              border-blue-100
              p-6
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  Total Workflows
                </p>

                <h3 className="text-4xl font-bold text-blue-700 mt-3">
                  {meta.total}
                </h3>
              </div>

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                "
              >
                <Layers3
                  className="text-blue-600"
                  size={26}
                />
              </div>
            </div>
          </div>

          {/* PAGE */}
          <div
            className="
              bg-white
              rounded-3xl
              border
              border-blue-100
              p-6
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  Current Page
                </p>

                <h3 className="text-4xl font-bold text-blue-700 mt-3">
                  {meta.page}
                </h3>
              </div>

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                "
              >
                <Activity
                  className="text-blue-600"
                  size={26}
                />
              </div>
            </div>
          </div>

          {/* LIMIT */}
          <div
            className="
              bg-white
              rounded-3xl
              border
              border-blue-100
              p-6
              shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  Per Page
                </p>

                <h3 className="text-4xl font-bold text-blue-700 mt-3">
                  {meta.limit}
                </h3>
              </div>

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                "
              >
                <ChevronRight
                  className="text-blue-600"
                  size={26}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* WORKFLOW LIST */}
        {/* ====================================================== */}

        <div className="space-y-5">
          {loading ? (
            <div
              className="
                bg-white
                rounded-3xl
                border
                border-blue-100
                p-12
                text-center
              "
            >
              <p className="text-slate-500 text-lg">
                Loading workflows...
              </p>
            </div>
          ) : workflows.length > 0 ? (
            workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.ID}
                id={workflow.ID}
                name={workflow.name}
              />
            ))
          ) : (
            <div
              className="
                bg-white
                border
                border-dashed
                border-blue-200
                rounded-3xl
                p-12
                text-center
              "
            >
              <h3 className="text-2xl font-semibold text-gray-700">
                No workflows found
              </h3>

              <p className="text-gray-500 mt-3">
                Try another keyword or create a
                new workflow.
              </p>
            </div>
          )}
        </div>

        {/* ====================================================== */}
        {/* REALTIME */}
        {/* ====================================================== */}

        <WorkflowRealtimeViewer />

        {/* ====================================================== */}
        {/* PAGINATION */}
        {/* ====================================================== */}

        <div className="flex items-center justify-between pt-2">
          {/* PREV */}
          <button
            disabled={meta.page <= 1}
            onClick={() =>
              fetchWorkflows(
                meta.page - 1,
                search
              )
            }
            className="
              bg-white
              border
              border-blue-100
              hover:border-blue-200
              px-6
              py-3
              rounded-2xl
              font-medium
              transition-all
              disabled:opacity-40
            "
          >
            Previous
          </button>

          {/* PAGE */}
          <div
            className="
              bg-white
              border
              border-blue-100
              rounded-2xl
              px-5
              py-3
              text-gray-600
              font-medium
            "
          >
            Page {meta.page}
          </div>

          {/* NEXT */}
          <button
            disabled={
              meta.page * meta.limit >=
              meta.total
            }
            onClick={() =>
              fetchWorkflows(
                meta.page + 1,
                search
              )
            }
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-6
              py-3
              rounded-2xl
              font-medium
              transition-all
              disabled:opacity-40
            "
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}