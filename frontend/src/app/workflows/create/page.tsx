"use client";

import { useCallback, useState } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from "reactflow";

import "reactflow/dist/style.css";

import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";

import api from "@/lib/api";

const initialNodes = [
  {
    id: "START",

    position: {
      x: 250,
      y: 50,
    },

    data: {
      label: "START",
    },

    style: {
      background: "#2563eb",
      color: "white",
      borderRadius: 16,
      border: "none",
      padding: 10,
      width: 150,
      textAlign: "center",
      fontWeight: 700,
    },
  },
];

const initialEdges: Edge[] = [];

export default function CreateWorkflowPage() {
  const router = useRouter();

  const [workflowName, setWorkflowName] =
    useState("");

  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  const [saving, setSaving] = useState(false);

  // =========================
  // CONNECT NODES
  // =========================

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  // =========================
  // ADD NODE
  // =========================

  const addNode = () => {
    const id = `NODE_${nodes.length + 1}`;

    const newNode = {
      id,

      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },

      data: {
        label: id,
      },

      style: {
        background: "#ffffff",
        color: "#1e3a8a",
        borderRadius: 16,
        border: "2px solid #bfdbfe",
        padding: 10,
        width: 160,
        textAlign: "center",
        fontWeight: 700,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // =========================
  // SAVE WORKFLOW
  // =========================

  const saveWorkflow = async () => {
    try {
      setSaving(true);

      const payload = {
        name: workflowName,

        definition: {
          nodes: nodes.map((node) => ({
            id: node.id,
            type:
              node.id === "START"
                ? "start"
                : "task",
          })),

          edges: edges.map((edge) => ({
            from: edge.source,
            to: edge.target,
          })),
        },
      };

      await api.post("/workflows", payload);

      router.push("/workflows");
    } catch (error) {
      console.error(error);

      alert("failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Create Workflow
            </h1>

            <p className="text-gray-500 mt-2">
              Build workflow visually
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={addNode}
              className="
                bg-white
                border
                border-blue-200
                hover:bg-blue-50
                text-blue-700
                px-5
                py-3
                rounded-2xl
                font-semibold
              "
            >
              + Add Node
            </button>

            <button
              onClick={saveWorkflow}
              disabled={saving}
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-6
                py-3
                rounded-2xl
                font-semibold
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : "Save Workflow"}
            </button>
          </div>
        </div>

        {/* WORKFLOW NAME */}
        <div className="bg-white rounded-3xl border border-blue-100 p-5">
          <label className="block mb-3 text-sm font-semibold text-gray-700">
            Workflow Name
          </label>

          <input
            value={workflowName}
            onChange={(e) =>
              setWorkflowName(
                e.target.value
              )
            }
            placeholder="my-awesome-workflow"
            className="
              w-full
              border
              border-blue-100
              rounded-2xl
              px-5
              py-4
              outline-none
              focus:border-blue-400
            "
          />
        </div>

        {/* FLOW BUILDER */}
        <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden">
          <div className="h-[700px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <MiniMap />

              <Controls />

              <Background />
            </ReactFlow>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}