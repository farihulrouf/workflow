"use client";

import { useCallback, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

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
  Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

type FlowNode = Node<{
  label: string;
}>;

export default function CreateWorkflowPage() {
  // =========================
  // STATES
  // =========================

  const [workflowName, setWorkflowName] =
    useState("");

  const [saving, setSaving] = useState(false);

  // =========================
  // INITIAL NODES
  // =========================

  const initialNodes: FlowNode[] = [
    {
      id: "start",

      type: "default",

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
        borderRadius: 20,
        padding: 14,
        width: 180,
        border: "none",
        textAlign: "center" as const,
        fontWeight: 700,
      },
    },
  ];

  // =========================
  // INITIAL EDGES
  // =========================

  const initialEdges: Edge[] = [];

  // =========================
  // REACT FLOW STATE
  // =========================

  const [nodes, setNodes, onNodesChange] =
    useNodesState<FlowNode>(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>(initialEdges);

  // =========================
  // CONNECT EDGES
  // =========================

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,

            animated: true,

            style: {
              stroke: "#2563eb",
              strokeWidth: 2,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // =========================
  // ADD NODE
  // =========================

  const addNode = () => {
    const newNode: FlowNode = {
      id: crypto.randomUUID(),

      type: "default",

      position: {
        x: Math.random() * 500,
        y: Math.random() * 400,
      },

      data: {
        label: `NODE ${nodes.length + 1}`,
      },

      style: {
        background: "white",
        color: "#1e293b",
        borderRadius: 18,
        border: "2px solid #bfdbfe",
        padding: 14,
        width: 180,
        textAlign: "center" as const,
        fontWeight: 600,
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
            type: "task",
          })),

          edges: edges.map((edge) => ({
            from: edge.source,
            to: edge.target,
          })),
        },
      };

      await api.post(
        "/workflows",
        payload
      );

      alert("Workflow created successfully");

      window.location.href = "/workflows";
    } catch (error) {
      console.error(error);

      alert("Failed to create workflow");
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
            <h1 className="text-4xl font-black text-slate-800">
              Create Workflow
            </h1>

            <p className="text-gray-500 mt-2">
              Design your workflow visually
            </p>
          </div>

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
              transition-all
              disabled:opacity-50
            "
          >
            {saving
              ? "Saving..."
              : "Save Workflow"}
          </button>
        </div>

        {/* FORM */}
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
          <label className="block text-sm font-medium text-gray-600 mb-3">
            Workflow Name
          </label>

          <input
            value={workflowName}
            onChange={(e) =>
              setWorkflowName(
                e.target.value
              )
            }
            placeholder="example: ecommerce-workflow"
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

        {/* TOOLBAR */}
        <div className="flex items-center gap-4">
          <button
            onClick={addNode}
            className="
              bg-white
              border
              border-blue-100
              hover:border-blue-300
              px-5
              py-3
              rounded-2xl
              font-medium
              transition-all
            "
          >
            + Add Node
          </button>
        </div>

        {/* FLOW EDITOR */}
        <div
          className="
            bg-white
            rounded-[32px]
            border
            border-blue-100
            overflow-hidden
            shadow-sm
          "
          style={{
            height: "700px",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={
              onNodesChange
            }
            onEdgesChange={
              onEdgesChange
            }
            onConnect={onConnect}
            fitView
          >
            <MiniMap />

            <Controls />

            <Background />
          </ReactFlow>
        </div>
      </div>
    </DashboardLayout>
  );
}
