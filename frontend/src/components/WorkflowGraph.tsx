"use client";

import { useEffect, useState } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
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
  step: string;
  status: string;
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
  // SSE REALTIME
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
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // =========================
  // NODE COLOR
  // =========================

  const getNodeColor = (status?: string) => {
    switch (status) {
      case "running":
        return {
          background: "#fef3c7",
          border: "#f59e0b",
          text: "#92400e",
        };

      case "success":
        return {
          background: "#dcfce7",
          border: "#22c55e",
          text: "#166534",
        };

      case "failed":
        return {
          background: "#fee2e2",
          border: "#ef4444",
          text: "#991b1b",
        };

      default:
        return {
          background: "#ffffff",
          border: "#bfdbfe",
          text: "#1e3a8a",
        };
    }
  };

  // =========================
  // BUILD NODES
  // =========================

  const flowNodes: Node[] = nodes.map(
    (node, index) => {
      const color = getNodeColor(
        nodeStatus[node.id]
      );

      return {
        id: node.id,

        data: {
          label: node.id,
        },

        position: {
          x: index * 220,
          y:
            node.type === "start"
              ? 50
              : node.type === "finish"
              ? 260
              : 150,
        },

        style: {
          padding: 14,
          borderRadius: 18,
          border: `2px solid ${color.border}`,
          background: color.background,
          color: color.text,
          fontWeight: 700,
          width: 160,
          textAlign: "center",
          transition: "all 0.3s ease",
          boxShadow:
            "0 10px 25px rgba(59,130,246,0.08)",
        },
      };
    }
  );

  // =========================
  // BUILD EDGES
  // =========================

  const flowEdges: Edge[] = edges.map(
    (edge, index) => ({
      id: `${edge.from}-${edge.to}-${index}`,

      source: edge.from,

      target: edge.to,

      animated: true,
    })
  );

  return (
    <div className="w-full h-[650px] rounded-3xl overflow-hidden border border-blue-100 bg-white">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
      >
        <MiniMap />

        <Controls />

        <Background />
      </ReactFlow>
    </div>
  );
}