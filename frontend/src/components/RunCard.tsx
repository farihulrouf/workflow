"use client";

import Link from "next/link";

interface RunCardProps {
  id: number;
  workflow_id: number;
  status: string;
}

export default function RunCard({
  id,
  workflow_id,
  status,
}: RunCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "RUNNING":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-blue-100
        p-6
        shadow-sm
        hover:shadow-md
        transition-all
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xl text-slate-800">
            Run #{id}
          </h3>

          <p className="text-gray-500 mt-1">
            Workflow ID: {workflow_id}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`
              px-4
              py-2
              rounded-xl
              text-sm
              font-semibold
              ${getStatusColor()}
            `}
          >
            {status}
          </div>

          <Link
            href={`/runs/${id}`}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-5
              py-2
              rounded-xl
              font-medium
            "
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}