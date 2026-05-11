"use client";

import { useEffect, useState, useCallback } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

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

import {
  Save,
  Plus,
  ArrowLeft,
} from "lucide-react";

import "@xyflow/react/dist/style.css";

// ======================================================
// TYPES
// ======================================================

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

// ======================================================
// PAGE
// ======================================================

export default function EditWorkflowPage() {
  const params = useParams();

  const router = useRouter();

  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [workflowName, setWorkflowName] =
    useState("");

  // ======================================================
  // FLOW STATES
  // ======================================================

  const [nodes, setNodes, onNodesChange] =
    useNodesState<FlowNode>([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>([]);

  // ======================================================
  // FETCH WORKFLOW
  // ======================================================

  const fetchWorkflow = async () => {
    try {
      const response = await api.get(
        `/workflows/${params.id}`
      );

      const workflow: WorkflowResponse =
        response.data;

      setWorkflowName(workflow.name);

      // ======================================================
      // CONVERT NODES
      // ======================================================

      const flowNodes: FlowNode[] =
        workflow.definition.nodes.map(
          (node, index) => ({
            id: node.id,

            type: "default",

            position: {
              x: 250 * (index % 3),
              y:
                150 *
                Math.floor(index / 3),
            },

            data: {
              label: node.id,
            },

            style: {
              background:
                node.type === "start"
                  ? "#2563eb"
                  : "white",

              color:
                node.type === "start"
                  ? "white"
                  : "#1e293b",

              borderRadius: 20,

              border:
                "2px solid #bfdbfe",

              padding: 14,

              width: 180,

              textAlign:
                "center" as const,

              fontWeight: 700,
            },
          })
        );

      // ======================================================
      // CONVERT EDGES
      // ======================================================

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
        "Failed to fetch workflow"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchWorkflow();
  }, []);

  // ======================================================
  // CONNECT EDGES
  // ======================================================

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

  // ======================================================
  // ADD NODE
  // ======================================================

  const addNode = () => {
    const newNode: FlowNode = {
      id: crypto.randomUUID(),

      type: "default",

      position: {
        x: Math.random() * 500,
        y: Math.random() * 400,
      },

      data: {
        label: `NODE ${
          nodes.length + 1
        }`,
      },

      style: {
        background: "white",

        color: "#1e293b",

        borderRadius: 20,

        border:
          "2px solid #bfdbfe",

        padding: 14,

        width: 180,

        textAlign: "center" as const,

        fontWeight: 700,
      },
    };

    setNodes((nds) => [
      ...nds,
      newNode,
    ]);
  };

  // ======================================================
  // SAVE WORKFLOW
  // ======================================================

  const saveWorkflow = async () => {
    try {
      setSaving(true);

      const payload = {
        name: workflowName,

        definition: {
          nodes: nodes.map((node) => ({
            id: node.id,

            type:
              node.id === "start"
                ? "start"
                : "task",
          })),

          edges: edges.map((edge) => ({
            from: edge.source,

            to: edge.target,
          })),
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

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading workflow editor...
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

          <div className="relative z-10 flex items-center justify-between">
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

              <h1 className="text-5xl font-black">
                Edit Workflow
              </h1>

              <p className="text-blue-100 text-lg mt-4">
                Visual workflow
                orchestration editor.
              </p>
            </div>

            {/* SAVE */}
            <button
              onClick={saveWorkflow}
              disabled={saving}
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
              <Save size={22} />

              {saving
                ? "Saving..."
                : "Save Workflow"}
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* FORM */}
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
            placeholder="workflow-name"
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

        {/* ====================================================== */}
        {/* TOOLBAR */}
        {/* ====================================================== */}

        <div className="flex items-center gap-4">
          <button
            onClick={addNode}
            className="
              inline-flex
              items-center
              gap-2
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
            <Plus size={18} />

            Add Node
          </button>
        </div>

        {/* ====================================================== */}
        {/* FLOW EDITOR */}
        {/* ====================================================== */}

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
            height: "720px",
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