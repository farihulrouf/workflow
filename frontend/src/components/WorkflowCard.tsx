"use client";

import Link from "next/link";

import {
  Play,
  Pencil,
  ArrowRight,
  Layers3,
} from "lucide-react";

import api from "@/lib/api";

interface WorkflowCardProps {
  id: number;
  name: string;
}

export default function WorkflowCard({
  id,
  name,
}: WorkflowCardProps) {
  // =========================
  // RUN WORKFLOW
  // =========================

  const runWorkflow = async () => {
    try {
      await api.post(
        `/workflows/${id}/run`
      );

      alert(
        "Workflow execution started"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to run workflow"
      );
    }
  };

  return (
    <div
      className="
        bg-white
        rounded-[32px]
        border
        border-blue-100
        p-7
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
      "
    >
      <div className="flex items-center justify-between gap-6">
        {/* LEFT */}
        <div className="flex items-start gap-5">
          {/* ICON */}
          <div
            className="
              w-16
              h-16
              rounded-3xl
              bg-blue-50
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <Layers3
              size={28}
              className="text-blue-600"
            />
          </div>

          {/* INFO */}
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                bg-blue-50
                text-blue-700
                px-3
                py-1
                rounded-xl
                text-sm
                font-semibold
                mb-4
              "
            >
              Workflow
            </div>

            <h3 className="text-2xl font-bold text-slate-800">
              {name}
            </h3>

            <p className="text-slate-500 mt-2">
              Workflow ID: {id}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* RUN */}
          <button
            onClick={runWorkflow}
            className="
              inline-flex
              items-center
              gap-2
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
            "
          >
            <Play size={18} />

            Run
          </button>

          {/* EDIT */}
          <Link
            href={`/workflows/${id}/edit`}
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
              font-semibold
              transition-all
            "
          >
            <Pencil size={18} />

            Edit
          </Link>

          {/* VIEW */}
          <Link
            href={`/workflows/${id}`}
            className="
              inline-flex
              items-center
              gap-2
              bg-slate-100
              hover:bg-slate-200
              text-slate-700
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
            "
          >
            View

            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}