"use client";

import { useEffect, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import WorkflowGraph from "@/components/WorkflowGraph";

import api from "@/lib/api";

import {
  Play,
  ArrowLeft,
  Activity,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

interface Workflow {
  ID: number;

  name: string;

  definition: {
    nodes: {
      id: string;
      type: string;
    }[];

    edges: {
      from: string;
      to: string;
    }[];
  };
}

// ======================================================
// PAGE
// ======================================================

export default function WorkflowDetailPage() {
  const params = useParams();

  const router = useRouter();

  // ======================================================
  // STATES
  // ======================================================

  const [workflow, setWorkflow] =
    useState<Workflow | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [running, setRunning] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // realtime node statuses
  const [nodeStatuses, setNodeStatuses] =
    useState<Record<string, string>>(
      {}
    );

  // ======================================================
  // FETCH WORKFLOW
  // ======================================================

  const fetchWorkflow = async () => {
    try {
      const response = await api.get(
        `/workflows/${params.id}`
      );

      setWorkflow(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RUN WORKFLOW
  // ======================================================

  const runWorkflow = async () => {
    try {
      setRunning(true);

      setMessage("");

      // reset statuses
      setNodeStatuses({});

      const response = await api.post(
        `/workflows/${params.id}/run`
      );

      setMessage(response.data.message);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.error ||
          "failed to run workflow"
      );
    } finally {
      setRunning(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchWorkflow();
  }, []);

  // ======================================================
  // SSE REALTIME
  // ======================================================

  useEffect(() => {
    const eventSource =
      new EventSource(
        "http://localhost:8080/events"
      );

    eventSource.onmessage = (
      event
    ) => {
      try {
        const data = JSON.parse(
          event.data
        );

        // ignore other workflows
        if (
          data.workflow_id !==
          workflow?.ID
        ) {
          return;
        }

        // update node status
        if (
          data.node_id &&
          data.status
        ) {
          setNodeStatuses((prev) => ({
            ...prev,
            [data.node_id]:
              data.status,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [workflow]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading workflow...
        </div>
      </DashboardLayout>
    );
  }

  // ======================================================
  // NOT FOUND
  // ======================================================

  if (!workflow) {
    return (
      <DashboardLayout>
        <div className="text-red-500">
          Workflow not found
        </div>
      </DashboardLayout>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ====================================================== */}
        {/* HEADER */}
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
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-10">
            {/* LEFT */}
            <div>
              <button
                onClick={() =>
                  router.back()
                }
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

                Back
              </button>

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
                  DAG Workflow
                </span>
              </div>

              <h1 className="text-5xl font-black">
                {workflow.name}
              </h1>

              <p className="text-blue-100 text-lg mt-5">
                Realtime workflow
                orchestration & DAG
                execution monitoring.
              </p>
            </div>

            {/* ACTION */}
            <button
              onClick={runWorkflow}
              disabled={running}
              className="
                inline-flex
                items-center
                gap-3
                bg-white
                text-blue-700
                px-8
                py-4
                rounded-3xl
                font-bold
                text-lg
                hover:bg-blue-50
                transition-all
                shadow-lg
                disabled:opacity-50
              "
            >
              <Play size={22} />

              {running
                ? "Running..."
                : "Run Workflow"}
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* MESSAGE */}
        {/* ====================================================== */}

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

        {/* ====================================================== */}
        {/* STATS */}
        {/* ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* NODES */}
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
                  Nodes
                </p>

                <h3 className="text-4xl font-bold text-blue-700 mt-3">
                  {
                    workflow.definition
                      .nodes.length
                  }
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
                <GitBranch
                  className="text-blue-600"
                  size={26}
                />
              </div>
            </div>
          </div>

          {/* EDGES */}
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
                  Connections
                </p>

                <h3 className="text-4xl font-bold text-blue-700 mt-3">
                  {
                    workflow.definition
                      .edges.length
                  }
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

          {/* STATUS */}
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
                  Status
                </p>

                <h3 className="text-4xl font-bold text-green-600 mt-3">
                  LIVE
                </h3>
              </div>

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-green-50
                  flex
                  items-center
                  justify-center
                "
              >
                <CheckCircle2
                  className="text-green-600"
                  size={26}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* WORKFLOW GRAPH */}
        {/* ====================================================== */}

        <div
          className="
            bg-white
            rounded-[32px]
            border
            border-blue-100
            p-6
            shadow-sm
          "
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Workflow Graph
            </h2>

            <p className="text-gray-500 mt-1">
              Visual realtime DAG
              execution flow.
            </p>
          </div>

          <WorkflowGraph
            nodes={
              workflow.definition.nodes
            }
            edges={
              workflow.definition.edges
            }
            nodeStatuses={
              nodeStatuses
            }
          />
        </div>

        {/* ====================================================== */}
        {/* CONNECTIONS */}
        {/* ====================================================== */}

        <div
          className="
            bg-white
            rounded-[32px]
            border
            border-blue-100
            p-6
            shadow-sm
          "
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Workflow Connections
          </h2>

          <div className="space-y-4">
            {workflow.definition.edges.map(
              (
                edge,
                index
              ) => (
                <div
                  key={index}
                  className="
                    border
                    border-blue-100
                    rounded-2xl
                    p-5
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div className="font-semibold text-slate-700">
                    {edge.from}
                  </div>

                  <div className="text-blue-400 text-xl">
                    →
                  </div>

                  <div className="font-semibold text-slate-700">
                    {edge.to}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}