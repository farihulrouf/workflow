"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from "reactflow";

import "reactflow/dist/style.css";

interface WorkflowNode {
  id: string;
  type: string;
}

interface WorkflowEdge {
  from: string;
  to: string;
}

interface Props {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export default function WorkflowGraph({
  nodes,
  edges,
}: Props) {
  // AUTO POSITION SIMPLE
  const flowNodes: Node[] = nodes.map(
    (node, index) => ({
      id: node.id,

      data: {
        label: node.id,
      },

      position: {
        x: (index % 3) * 250,
        y: Math.floor(index / 3) * 150,
      },

      style: {
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: 16,
        padding: 10,
        width: 140,
        textAlign: "center",
        fontWeight: 600,
      },
    })
  );

  const flowEdges: Edge[] = edges.map(
    (edge, index) => ({
      id: `${edge.from}-${edge.to}-${index}`,

      source: edge.from,

      target: edge.to,

      animated: true,

      style: {
        stroke: "#3b82f6",
        strokeWidth: 2,
      },
    })
  );

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border bg-white">
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