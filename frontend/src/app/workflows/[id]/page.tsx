"use client";

import Link from "next/link";

import {
  use,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Bell,
  LayoutDashboard,
  PlayCircle,
  Settings,
  Workflow,
} from "lucide-react";

import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

import api from "@/lib/api";

interface WorkflowNode {
  id: string;
  type: string;
}

interface WorkflowEdge {
  from: string;
  to: string;
}

interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowItem {
  ID: number;
  name: string;
  definition: WorkflowData;
}

export default function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [workflow, setWorkflow] =
    useState<WorkflowItem | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const fetchWorkflow = async () => {
    try {
      const response = await api.get(
        `/workflows/${id}`
      );

      setWorkflow(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading workflow...
        </p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex items-center justify-center">
        <p className="text-red-500 text-lg">
          Workflow not found
        </p>
      </div>
    );
  }

  const nodes: Node[] =
    workflow.definition.nodes.map(
      (node, index) => ({
        id: node.id,

        data: {
          label: node.id,
        },

        position: {
          x: index * 220,

          y:
            node.type === "task"
              ? 150
              : 0,
        },

        style: {
          borderRadius: 20,

          border:
            "1px solid #bfdbfe",

          padding: 10,

          background: "white",

          color: "#1d4ed8",

          fontWeight: 600,

          width: 170,

          textAlign: "center",

          boxShadow:
            "0 1px 3px rgba(0,0,0,0.05)",
        },
      })
    );

  const edges: Edge[] =
    workflow.definition.edges.map(
      (edge) => ({
        id: `${edge.from}-${edge.to}`,

        source: edge.from,

        target: edge.to,

        animated: true,
      })
    );

  return (
    <div className="flex min-h-screen bg-[#f7fbff]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-blue-100 flex flex-col">
        {/* LOGO */}
        <div className="p-6 border-b border-blue-100">
          <h1 className="text-3xl font-bold text-blue-700">
            FlowForge
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Workflow Platform
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition text-gray-700">
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-700 font-medium">
            <Workflow size={18} />
            Workflows
          </button>

          <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition text-gray-700">
            <PlayCircle size={18} />
            Runs
          </button>

          <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition text-gray-700">
            <Settings size={18} />
            Settings
          </button>
        </nav>

        {/* USER */}
        <div className="p-4 border-t border-blue-100">
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">
              Logged in
            </p>

            <p className="font-semibold text-blue-700">
              admin@test.com
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-blue-100 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Workflow Detail
            </h2>

            <p className="text-gray-500 text-sm">
              Visual workflow graph
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50">
              <Bell
                size={18}
                className="text-blue-700"
              />
            </button>

            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-8">
          {/* BACK */}
          <div className="mb-6">
            <Link href="/workflows">
              <button className="flex items-center gap-2 bg-white border border-blue-100 hover:bg-blue-50 px-5 py-3 rounded-2xl transition">
                <ArrowLeft size={18} />
                Back to Workflows
              </button>
            </Link>
          </div>

          {/* HEADER */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-blue-700">
                {workflow.name}
              </h1>

              <p className="text-gray-500 mt-2">
                Workflow ID:{" "}
                {workflow.ID}
              </p>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition shadow-sm">
              Run Workflow
            </button>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              {/* INFO */}
              <div className="bg-white rounded-3xl border border-blue-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-5">
                  Workflow Info
                </h2>

                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Name
                    </p>

                    <p className="font-semibold text-gray-800">
                      {workflow.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Nodes
                    </p>

                    <p className="font-semibold text-gray-800">
                      {
                        workflow
                          .definition.nodes
                          .length
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Edges
                    </p>

                    <p className="font-semibold text-gray-800">
                      {
                        workflow
                          .definition.edges
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* RAW JSON */}
              <div className="bg-white rounded-3xl border border-blue-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Raw JSON
                </h2>

                <pre className="text-xs overflow-auto bg-blue-50 rounded-2xl p-4 text-blue-900 max-h-[400px]">
                  {JSON.stringify(
                    workflow.definition,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            {/* GRAPH */}
            <div className="col-span-2">
              <div className="bg-white rounded-3xl border border-blue-100 h-[750px] overflow-hidden shadow-sm">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                >
                  <MiniMap />

                  <Controls />

                  <Background />
                </ReactFlow>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}