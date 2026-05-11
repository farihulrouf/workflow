
"use client";

import { useEffect, useState, useCallback } from "react";

import { useParams, useRouter } from "next/navigation";

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

// =========================
// TYPES
// =========================

type FlowNode = Node<{
  label: string;
}>;

interface WorkflowResponse {
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

export default function EditWorkflowPage() {
  const params = useParams();

  const router = useRouter();

  // =========================
  // STATES
  // =========================

  const [workflowName, setWorkflowName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =========================
  // REACT FLOW
  // =========================

  const [nodes, setNodes, onNodesChange] =
    useNodesState<FlowNode>([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>([]);

  // =========================
  // FETCH WORKFLOW
  // =========================

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const fetchWorkflow = async () => {
    try {
      const response =
        await api.get<WorkflowResponse>(
          `/workflows/${params.id}`
        );

      const workflow = response.data;

      setWorkflowName(workflow.name);

      // =========================
      // LOAD NODES
      // =========================

      const flowNodes: FlowNode[] =
        workflow.definition.nodes.map(
          (node, index) => ({
            id: node.id,

            type: "default",

            position: {
              x: 150 * index,
              y: 120,
            },

            data: {
              label: node.id,
            },

            style: {
              background:
                node.type === "start"
                  ? "#2563eb"
                  : "#ffffff",

              color:
                node.type === "start"
                  ? "white"
                  : "#0f172a",

              borderRadius: 18,

              border:
                node.type === "start"
                  ? "none"
                  : "2px solid #bfdbfe",

              padding: 14,

              width: 180,

              textAlign:
                "center" as const,

              fontWeight: 600,
            },
          })
        );

      // =========================
      // LOAD EDGES
      // =========================

      const flowEdges: Edge[] =
        workflow.definition.edges.map(
          (edge, index) => ({
            id: `${edge.from}-${edge.to}-${index}`,

            source: edge.from,

            target: edge.to,

            animated: true,

            style: {
              stroke: "#2563eb",
              strokeWidth: 2,
            },
          })
        );

      setNodes(flowNodes);

      setEdges(flowEdges);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load workflow"
      );
    } finally {
      setLoading(false);
    }
  };

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
        label: `NODE_${nodes.length + 1}`,
      },

      style: {
        background: "white",

        color: "#0f172a",

        borderRadius: 18,

        border: "2px solid #bfdbfe",

        padding: 14,

        width: 180,

        textAlign: "center" as const,

        fontWeight: 600,
      },
    };

    setNodes((nds) => [
      ...nds,
      newNode,
    ]);
  };

  // =========================
  // SAVE
  // =========================

  const saveWorkflow = async () => {
    try {
      setSaving(true);

      const payload = {
        name: workflowName,

        definition: {
          nodes: nodes.map(
            (node) => ({
              id: node.id,
              type: "task",
            })
          ),

          edges: edges.map(
            (edge) => ({
              from: edge.source,
              to: edge.target,
            })
          ),
        },
      };

      await api.put(
        `/workflows/${params.id}`,
        payload
      );

      alert(
        "Workflow updated successfully"
      );

      router.push(
        `/workflows/${params.id}`
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update workflow"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteWorkflow = async () => {
    const confirmDelete =
      confirm(
        "Delete this workflow?"
      );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/workflows/${params.id}`
      );

      alert(
        "Workflow deleted"
      );

      router.push("/workflows");
    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete workflow"
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading workflow...
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
              onClick={() =>
                router.back()
              }
              className="
                text-blue-600
                hover:text-blue-700
                mb-3
              "
            >
              ← Back
            </button>

            <h1 className="text-4xl font-black text-slate-800">
              Edit Workflow
            </h1>

            <p className="text-gray-500 mt-2">
              Update your DAG workflow
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={
                deleteWorkflow
              }
              className="
                bg-red-500
                hover:bg-red-600
                text-white
                px-5
                py-3
                rounded-2xl
                font-semibold
              "
            >
              Delete
            </button>

            <button
              onClick={
                saveWorkflow
              }
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
                : "Save Changes"}
            </button>
          </div>
        </div>

        {/* NAME */}
        <div
          className="
            bg-white
            rounded-3xl
            border
            border-blue-100
            p-6
          "
        >
          <label className="block text-sm text-gray-500 mb-3">
            Workflow Name
          </label>

          <input
            value={workflowName}
            onChange={(e) =>
              setWorkflowName(
                e.target.value
              )
            }
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
            "
          >
            + Add Node
          </button>
        </div>

        {/* FLOW */}
        <div
          className="
            bg-white
            rounded-[32px]
            border
            border-blue-100
            overflow-hidden
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
