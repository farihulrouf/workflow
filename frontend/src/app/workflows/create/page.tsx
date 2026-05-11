"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
  MarkerType,
  Panel,
  Handle,
  Position,
  NodeProps,
} from "@xyflow/react";

import {
  Play,
  Zap,
  Trash2,
  Save,
  Plus,
  Globe,
  Timer,
  Terminal,
  AlertTriangle,
} from "lucide-react";

import "@xyflow/react/dist/style.css";

// ======================================================
// TYPES
// ======================================================

type WorkflowNodeData = {
  label: string;
  description?: string;

  workflowType?:
    | "start"
    | "http"
    | "delay"
    | "script"
    | "fail";

  config?: Record<string, any>;

  status?:
    | "idle"
    | "running"
    | "success"
    | "failed";
};

type FlowNode =
  Node<WorkflowNodeData>;

// ======================================================
// START NODE
// ======================================================

function StartNode({
  data,
}: NodeProps<FlowNode>) {
  return (
    <div
      className="
        relative
        min-w-[240px]
        rounded-[28px]
        bg-gradient-to-br
        from-blue-600
        to-blue-500
        text-white
        shadow-xl
        shadow-blue-200
        border
        border-blue-400
        px-5
        py-5
      "
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white"
      />

      <div className="flex items-center gap-4">
        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-white/20
            flex
            items-center
            justify-center
          "
        >
          <Play size={22} />
        </div>

        <div>
          <div className="text-lg font-bold">
            {data.label}
          </div>

          <div className="text-sm text-blue-100 mt-1">
            Workflow Entry
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// TASK NODE
// ======================================================

function TaskNode({
  data,
}: NodeProps<FlowNode>) {
  const statusColor = {
    idle: "border-blue-100",
    running:
      "border-yellow-400 bg-yellow-50",
    success:
      "border-green-400 bg-green-50",
    failed:
      "border-red-400 bg-red-50",
  };

  const renderIcon = () => {
    switch (
      data.workflowType
    ) {
      case "http":
        return (
          <Globe
            size={22}
            className="text-blue-600"
          />
        );

      case "delay":
        return (
          <Timer
            size={22}
            className="text-blue-600"
          />
        );

      case "script":
        return (
          <Terminal
            size={22}
            className="text-blue-600"
          />
        );

      case "fail":
        return (
          <AlertTriangle
            size={22}
            className="text-red-600"
          />
        );

      default:
        return (
          <Zap
            size={22}
            className="text-blue-600"
          />
        );
    }
  };

  return (
    <div
      className={`
        relative
        min-w-[260px]
        rounded-[28px]
        border-2
        bg-white
        px-5
        py-5
        shadow-lg
        transition-all
        duration-300
        hover:scale-[1.02]
        ${
          statusColor[
            data.status || "idle"
          ]
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500"
      />

      <div className="flex items-start gap-4">
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
          {renderIcon()}
        </div>

        <div className="flex-1">
          <div className="font-bold text-slate-800 text-lg">
            {data.label}
          </div>

          <div className="text-sm text-slate-500 mt-1 uppercase">
            {data.workflowType}
          </div>

          {data.config && (
            <div className="mt-3 text-xs text-slate-500 space-y-1">
              {Object.entries(
                data.config
              ).map(
                ([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold">
                      {key}:
                    </span>{" "}
                    {String(value)}
                  </div>
                )
              )}
            </div>
          )}

          <div className="mt-4">
            <span
              className={`
                text-xs
                px-3
                py-1
                rounded-full
                font-medium

                ${
                  data.status ===
                  "running"
                    ? "bg-yellow-100 text-yellow-700"
                    : ""
                }

                ${
                  data.status ===
                  "success"
                    ? "bg-green-100 text-green-700"
                    : ""
                }

                ${
                  data.status ===
                  "failed"
                    ? "bg-red-100 text-red-700"
                    : ""
                }

                ${
                  data.status ===
                    "idle" ||
                  !data.status
                    ? "bg-blue-100 text-blue-700"
                    : ""
                }
              `}
            >
              {data.status || "idle"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function CreateWorkflowPage() {
  // ======================================================
  // STATES
  // ======================================================

  const [workflowName, setWorkflowName] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState<
      "http" | "delay" | "script" | "fail"
    >("http");

  // ======================================================
  // NODE TYPES
  // ======================================================

  const nodeTypes = useMemo(
    () => ({
      startNode: StartNode,
      taskNode: TaskNode,
    }),
    []
  );

  // ======================================================
  // INITIAL NODES
  // ======================================================

  const initialNodes: FlowNode[] = [
    {
      id: "start",

      type: "startNode",

      position: {
        x: 450,
        y: 100,
      },

      data: {
        label: "START",
        workflowType: "start",
      },
    },
  ];

  // ======================================================
  // INITIAL EDGES
  // ======================================================

  const initialEdges: Edge[] = [];

  // ======================================================
  // FLOW STATES
  // ======================================================

  const [
    nodes,
    setNodes,
    onNodesChange,
  ] = useNodesState<FlowNode>(
    initialNodes
  );

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] = useEdgesState<Edge>(
    initialEdges
  );

  // ======================================================
  // SSE REALTIME
  // ======================================================

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:8080/events"
    );

    eventSource.onmessage = (
      event
    ) => {
      try {
        const data = JSON.parse(
          event.data
        );

        if (!data.step) return;

        setNodes((nds) =>
          nds.map((node) => {
            if (
              node.id ===
              data.step
            ) {
              return {
                ...node,

                data: {
                  ...node.data,

                  status:
                    data.status,
                },
              };
            }

            return node;
          })
        );
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [setNodes]);

  // ======================================================
  // CONNECT
  // ======================================================

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,

            type: "smoothstep",

            animated: true,

            markerEnd: {
              type: MarkerType.ArrowClosed,
            },

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
    let config = {};

    if (
      selectedType === "http"
    ) {
      config = {
        url: "https://jsonplaceholder.typicode.com/todos/1",
        method: "GET",
      };
    }

    if (
      selectedType === "delay"
    ) {
      config = {
        seconds: 5,
      };
    }

    if (
      selectedType === "script"
    ) {
      config = {
        command:
          "echo hello-flowforge",
      };
    }

    const newNode: FlowNode = {
      id: crypto.randomUUID(),

      type: "taskNode",

      position: {
        x:
          250 +
          Math.random() * 500,

        y:
          200 +
          Math.random() * 400,
      },

      data: {
        label: `${selectedType.toUpperCase()} NODE`,

        workflowType:
          selectedType,

        config,

        status: "idle",
      },
    };

    setNodes((nds) => [
      ...nds,
      newNode,
    ]);
  };

  // ======================================================
  // DELETE SELECTED
  // ======================================================

  const deleteSelected = () => {
    setNodes((nds) =>
      nds.filter(
        (node) => !node.selected
      )
    );

    setEdges((eds) =>
      eds.filter(
        (edge) => !edge.selected
      )
    );
  };

  // ======================================================
  // SAVE WORKFLOW
  // ======================================================

  const saveWorkflow = async () => {
    try {
      if (!workflowName) {
        alert(
          "Workflow name required"
        );

        return;
      }

      setSaving(true);

      const payload = {
        name: workflowName,

        definition: {
          nodes: nodes.map(
            (node) => ({
              id: node.id,

              type:
                node.data
                  .workflowType,

              config:
                node.data
                  .config || {},

              max_retries: 3,
            })
          ),

          edges: edges.map(
            (edge) => ({
              from:
                edge.source,

              to: edge.target,
            })
          ),
        },
      };

      console.log(payload);

      await api.post(
        "/workflows",
        payload
      );

      alert(
        "Workflow created successfully"
      );

      window.location.href =
        "/workflows";
    } catch (error) {
      console.error(error);

      alert(
        "Failed to create workflow"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // MOCK EXECUTION
  // ======================================================

  const simulateExecution =
    () => {
      const statuses = [
        "running",
        "success",
        "failed",
      ] as const;

      setNodes((nds) =>
        nds.map((node) => {
          if (
            node.id === "start"
          ) {
            return node;
          }

          const randomStatus =
            statuses[
              Math.floor(
                Math.random() *
                  statuses.length
              )
            ];

          return {
            ...node,

            data: {
              ...node.data,

              status:
                randomStatus,
            },
          };
        })
      );
    };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight">
              Create Workflow
            </h1>

            <p className="text-slate-500 mt-3 text-lg">
              Visual orchestration
              builder
            </p>
          </div>

          <button
            onClick={
              saveWorkflow
            }
            disabled={saving}
            className="
              flex
              items-center
              gap-3
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-7
              py-4
              rounded-3xl
              font-semibold
              transition-all
              shadow-xl
              shadow-blue-200
            "
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Workflow"}
          </button>
        </div>

        {/* FORM */}

        <div className="bg-white rounded-[32px] border border-blue-100 p-7 shadow-sm">
          <label className="block text-sm font-semibold text-slate-600 mb-4">
            Workflow Name
          </label>

          <input
            value={workflowName}
            onChange={(e) =>
              setWorkflowName(
                e.target.value
              )
            }
            placeholder="example: payment-pipeline"
            className="
              w-full
              border
              border-blue-100
              rounded-3xl
              px-6
              py-5
              outline-none
              text-lg
            "
          />
        </div>

        {/* TOOLBAR */}

        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(
                e.target
                  .value as any
              )
            }
            className="
              bg-white
              border
              border-blue-100
              px-5
              py-4
              rounded-3xl
              outline-none
            "
          >
            <option value="http">
              HTTP Node
            </option>

            <option value="delay">
              Delay Node
            </option>

            <option value="script">
              Script Node
            </option>

            <option value="fail">
              Fail Node
            </option>
          </select>

          <button
            onClick={addNode}
            className="
              flex
              items-center
              gap-2
              bg-white
              border
              border-blue-100
              hover:bg-blue-50
              px-6
              py-4
              rounded-3xl
              font-semibold
            "
          >
            <Plus size={18} />
            Add Node
          </button>

          <button
            onClick={
              deleteSelected
            }
            className="
              flex
              items-center
              gap-2
              bg-red-50
              text-red-600
              border
              border-red-100
              px-6
              py-4
              rounded-3xl
              font-semibold
            "
          >
            <Trash2 size={18} />
            Delete Selected
          </button>

          <button
            onClick={
              simulateExecution
            }
            className="
              bg-slate-900
              text-white
              px-6
              py-4
              rounded-3xl
              font-semibold
            "
          >
            Simulate Run
          </button>
        </div>

        {/* FLOW */}

        <div
          className="
            bg-white
            rounded-[36px]
            border
            border-blue-100
            overflow-hidden
            shadow-sm
          "
          style={{
            height: "780px",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={
              nodeTypes
            }
            onNodesChange={
              onNodesChange
            }
            onEdgesChange={
              onEdgesChange
            }
            onConnect={onConnect}
            fitView
          >
            <Background
              gap={20}
              size={1}
              color="#dbeafe"
            />

            <MiniMap />

            <Controls />

            <Panel
              position="top-right"
              className="
                bg-white/90
                border
                border-blue-100
                rounded-3xl
                px-5
                py-4
                shadow-xl
              "
            >
              <div className="space-y-3">
                <div className="font-bold text-slate-700">
                  Workflow Stats
                </div>

                <div className="text-sm text-slate-500">
                  Nodes:{" "}
                  <span className="font-semibold">
                    {nodes.length}
                  </span>
                </div>

                <div className="text-sm text-slate-500">
                  Edges:{" "}
                  <span className="font-semibold">
                    {edges.length}
                  </span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </DashboardLayout>
  );
}