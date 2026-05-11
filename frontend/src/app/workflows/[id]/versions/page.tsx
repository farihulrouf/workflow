"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";

import api from "@/lib/api";

import {
  ArrowLeft,
  Clock3,
  GitBranch,
  RotateCcw,
} from "lucide-react";

// =====================================
// TYPES
// =====================================

interface WorkflowVersion {
  ID: number;

  CreatedAt: string;

  workflow_id: number;

  version: number;

  name: string;

  definition: {
    nodes: any[];

    edges: any[];
  };
}

// =====================================
// PAGE
// =====================================

export default function WorkflowVersionsPage() {
  const params = useParams();

  // =====================================
  // STATES
  // =====================================

  const [versions, setVersions] =
    useState<WorkflowVersion[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [rollingBackId, setRollingBackId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  // =====================================
  // FETCH VERSIONS
  // =====================================

  const fetchVersions = async () => {
    try {
      const response = await api.get(
        `/workflows/${params.id}/versions`
      );

      setVersions(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // ROLLBACK
  // =====================================

  const rollbackVersion = async (
    versionId: number
  ) => {
    try {
      setRollingBackId(versionId);

      setMessage("");

      const response = await api.post(
        `/workflows/${params.id}/rollback/${versionId}`
      );

      setMessage(response.data.message);

      await fetchVersions();
    } catch (error: any) {
      console.error(error);

      setMessage(
        error?.response?.data?.error ||
          "failed to rollback workflow"
      );
    } finally {
      setRollingBackId(null);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    fetchVersions();
  }, []);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading workflow versions...
        </div>
      </DashboardLayout>
    );
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div
          className="
            rounded-[36px]
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
          <Link
            href={`/workflows/${params.id}`}
            className="
              inline-flex
              items-center
              gap-2
              text-white/90
              hover:text-white
              mb-6
            "
          >
            <ArrowLeft size={18} />

            Back to Workflow
          </Link>

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
            <GitBranch size={18} />

            <span className="text-sm font-medium">
              Workflow Versioning
            </span>
          </div>

          <h1 className="text-5xl font-black">
            Workflow Versions
          </h1>

          <p className="text-blue-100 text-lg mt-5">
            Track every workflow update &
            version history.
          </p>
        </div>

        {/* ===================================== */}
        {/* MESSAGE */}
        {/* ===================================== */}

        {message && (
          <div
            className="
              bg-blue-50
              border
              border-blue-200
              text-blue-700
              px-5
              py-4
              rounded-2xl
            "
          >
            {message}
          </div>
        )}

        {/* ===================================== */}
        {/* EMPTY */}
        {/* ===================================== */}

        {versions.length === 0 && (
          <div
            className="
              bg-white
              rounded-3xl
              border
              border-blue-100
              p-10
              text-center
              shadow-sm
            "
          >
            <h2 className="text-2xl font-bold text-gray-800">
              No versions found
            </h2>

            <p className="text-gray-500 mt-3">
              This workflow has no saved
              versions yet.
            </p>
          </div>
        )}

        {/* ===================================== */}
        {/* VERSION LIST */}
        {/* ===================================== */}

        <div className="space-y-6">
          {versions.map((version) => (
            <div
              key={version.ID}
              className="
                bg-white
                rounded-[32px]
                border
                border-blue-100
                p-8
                shadow-sm
                hover:shadow-md
                transition
              "
            >
              <div className="flex items-start justify-between gap-6">
                {/* LEFT */}
                <div className="space-y-5">
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      bg-blue-50
                      text-blue-700
                      px-4
                      py-2
                      rounded-2xl
                      font-semibold
                    "
                  >
                    <GitBranch size={18} />

                    Version {version.version}
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {version.name}
                    </h2>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-gray-500
                        mt-3
                      "
                    >
                      <Clock3 size={16} />

                      {new Date(
                        version.CreatedAt
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex gap-4">
                  <div
                    className="
                      bg-slate-50
                      rounded-2xl
                      p-5
                      min-w-[140px]
                    "
                  >
                    <p className="text-sm text-gray-500">
                      Nodes
                    </p>

                    <h3 className="text-3xl font-bold text-blue-700 mt-2">
                      {
                        version.definition
                          .nodes.length
                      }
                    </h3>
                  </div>

                  <div
                    className="
                      bg-slate-50
                      rounded-2xl
                      p-5
                      min-w-[140px]
                    "
                  >
                    <p className="text-sm text-gray-500">
                      Edges
                    </p>

                    <h3 className="text-3xl font-bold text-blue-700 mt-2">
                      {
                        version.definition
                          .edges.length
                      }
                    </h3>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() =>
                    rollbackVersion(version.ID)
                  }
                  disabled={
                    rollingBackId === version.ID
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    font-semibold
                    transition
                    disabled:opacity-50
                  "
                >
                  <RotateCcw size={18} />

                  {rollingBackId ===
                  version.ID
                    ? "Rolling back..."
                    : "Rollback Version"}
                </button>
              </div>

              {/* JSON PREVIEW */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Definition Preview
                </h3>

                <pre
                  className="
                    bg-slate-950
                    text-green-400
                    p-6
                    rounded-3xl
                    overflow-x-auto
                    text-sm
                  "
                >
                  {JSON.stringify(
                    version.definition,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}