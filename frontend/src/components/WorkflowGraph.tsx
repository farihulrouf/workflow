"use client";

import { useEffect, useMemo, useState } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

interface NodeItem {
  id: string;
  type: string;
}

interface EdgeItem {
  from: string;
  to: string;
}

interface LogEvent {
  workflow_run_id: number;
  step: string;
  status: string;
  message: string;
  timestamp: number;
}

interface Props {
  nodes: NodeItem[];
  edges: EdgeItem[];
}

export default function WorkflowGraph({
  nodes,
  edges,
}: Props) {
  const [nodeStatus, setNodeStatus] = useState<
    Record<string, string>
  >({});

  // =========================
  // REALTIME SSE
  // =========================

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:8080/events"
    );

    eventSource.onmessage = (event) => {
      try {
        const data: LogEvent = JSON.parse(
          event.data
        );

        if (data.step) {
          setNodeStatus((prev) => ({
            ...prev,
            [data.step]: data.status,
          }));
        }
      } catch (error) {
        console.error(
          "Realtime parse error:",
          error
        );
      }
    };

    eventSource.onerror = (error) => {
      console.error(
        "Realtime connection error:",
        error
      );
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // =========================
  // NODE STYLE
  // =========================

  const getNodeStyle = (
    status?: string
  ) => {
    switch (status) {
      case "running":
        return {
          background: "#dbeafe",
          border: "#2563eb",
          text: "#1d4ed8",
          shadow:
            "0 0 0 6px rgba(37,99,235,0.15)",
        };

      case "success":
        return {
          background: "#dcfce7",
          border: "#22c55e",
          text: "#166534",
          shadow:
            "0 0 0 6px rgba(34,197,94,0.15)",
        };

      case "failed":
        return {
          background: "#fee2e2",
          border: "#ef4444",
          text: "#991b1b",
          shadow:
            "0 0 0 6px rgba(239,68,68,0.15)",
        };

      case "retrying":
        return {
          background: "#fef3c7",
          border: "#f59e0b",
          text: "#92400e",
          shadow:
            "0 0 0 6px rgba(245,158,11,0.15)",
        };

      default:
        return {
          background: "#ffffff",
          border: "#cbd5e1",
          text: "#0f172a",
          shadow:
            "0 10px 30px rgba(15,23,42,0.06)",
        };
    }
  };

  // =========================
  // BUILD FLOW NODES
  // =========================

  const flowNodes: Node[] = useMemo(() => {
    return nodes.map((node, index) => {
      const style = getNodeStyle(
        nodeStatus[node.id]
      );

      return {
        id: node.id,

        position: {
          x: (index % 4) * 260,
          y:
            Math.floor(index / 4) * 180,
        },

        data: {
          label: (
            <div className="space-y-2">
              <div className="text-base font-bold">
                {node.id}
              </div>

              <div className="text-xs opacity-70 uppercase">
                {node.type}
              </div>

              <div
                className={`
                  inline-flex
                  items-center
                  justify-center
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                `}
              >
                {nodeStatus[node.id] ||
                  "idle"}
              </div>
            </div>
          ),
        },

        style: {
          width: 190,
          borderRadius: 24,
          border: `2px solid ${style.border}`,
          background: style.background,
          color: style.text,
          padding: 20,
          fontWeight: 700,
          textAlign: "center",
          boxShadow: style.shadow,
          transition:
            "all 0.25s ease-in-out",
        },
      };
    });
  }, [nodes, nodeStatus]);

  // =========================
  // BUILD FLOW EDGES
  // =========================

  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((edge, index) => ({
      id: `${edge.from}-${edge.to}-${index}`,

      source: edge.from,

      target: edge.to,

      animated: true,

      markerEnd: {
        type: MarkerType.ArrowClosed,
      },

      style: {
        strokeWidth: 2.5,
        stroke: "#60a5fa",
      },
    }));
  }, [edges]);

  return (
    <div
      className="
        w-full
        h-[700px]
        rounded-[32px]
        overflow-hidden
        border
        border-blue-100
        bg-gradient-to-br
        from-slate-50
        to-blue-50
      "
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
      >
        <MiniMap
          pannable
          zoomable
        />

        <Controls />

        <Background gap={20} />
      </ReactFlow>
    </div>
  );
}