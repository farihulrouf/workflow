"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WorkflowGraph from "@/components/WorkflowGraph";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

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

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [workflow, setWorkflow] =
    useState<Workflow | null>(null);

  const [loading, setLoading] = useState(true);

  const [running, setRunning] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchWorkflow();
  }, []);

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

  const runWorkflow = async () => {
    try {
      setRunning(true);
      setMessage("");

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading workflow...
        </div>
      </DashboardLayout>
    );
  }

  if (!workflow) {
    return (
      <DashboardLayout>
        <div className="text-red-500">
          Workflow not found
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-3 text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              {workflow.name}
            </h1>

            <p className="text-gray-500 mt-1">
              Workflow detail & execution
            </p>
          </div>

          <button
            onClick={runWorkflow}
            disabled={running}
            className="
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-blue-300
              text-white
              px-5
              py-2.5
              rounded-xl
              font-medium
              transition
            "
          >
            {running ? "Running..." : "Run Workflow"}
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className="
              bg-blue-50
              border
              border-blue-200
              text-blue-700
              px-4
              py-3
              rounded-xl
            "
          >
            {message}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border p-5">
            <div className="text-sm text-gray-500">
              Nodes
            </div>

            <div className="text-3xl font-bold mt-2">
              {workflow.definition.nodes.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5">
            <div className="text-sm text-gray-500">
              Edges
            </div>

            <div className="text-3xl font-bold mt-2">
              {workflow.definition.edges.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5">
            <div className="text-sm text-gray-500">
              Status
            </div>

            <div className="text-3xl font-bold mt-2 text-green-600">
              Ready
            </div>
          </div>
        </div>
        {/* GRAPH */}
<div className="bg-white rounded-3xl border p-6">
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-2xl font-bold">
        Workflow Graph
      </h2>

      <p className="text-gray-500 mt-1">
        Visual DAG execution flow
      </p>
    </div>
  </div>

  <WorkflowGraph
    nodes={workflow.definition.nodes}
    edges={workflow.definition.edges}
  />
</div>
        {/* NODES *
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-5">
            Workflow Nodes
          </h2>

          <div className="space-y-3">
            {workflow.definition.nodes.map((node) => (
              <div
                key={node.id}
                className="
                  border
                  rounded-xl
                  p-4
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <div className="font-semibold">
                    {node.id}
                  </div>

                  <div className="text-sm text-gray-500">
                    {node.type}
                  </div>
                </div>

                <div
                  className="
                    bg-blue-100
                    text-blue-700
                    px-3
                    py-1
                    rounded-lg
                    text-sm
                  "
                >
                  node
                </div>
              </div>
            ))}
          </div>
        </div>
        */}
        {/* EDGES */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-5">
            Workflow Connections
          </h2>

          <div className="space-y-3">
            {workflow.definition.edges.map(
              (edge, index) => (
                <div
                  key={index}
                  className="
                    border
                    rounded-xl
                    p-4
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div className="font-medium">
                    {edge.from}
                  </div>

                  <div className="text-gray-400">
                    →
                  </div>

                  <div className="font-medium">
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