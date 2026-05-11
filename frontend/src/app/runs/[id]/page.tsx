"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";

import api from "@/lib/api";

interface Run {
  ID: number;
  WorkflowID: number;
  Status: string;
  StartedAt: number;
  EndedAt: number;
}

interface Step {
  ID: number;
  NodeID: string;
  Status: string;
  Logs: string;
}

export default function RunDetailPage() {
  const params = useParams();

  const router = useRouter();

  const [run, setRun] = useState<Run | null>(
    null
  );

  const [steps, setSteps] = useState<Step[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchRun();
  }, []);

  const fetchRun = async () => {
    try {
      const response = await api.get(
        `/workflow-runs/${params.id}`
      );

      setRun(response.data.run);

      setSteps(response.data.steps);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading run detail...
        </div>
      </DashboardLayout>
    );
  }

  if (!run) {
    return (
      <DashboardLayout>
        <div className="text-red-500">
          Run not found
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="
                text-blue-600
                hover:text-blue-800
                mb-3
              "
            >
              ← Back
            </button>

            <h1 className="text-4xl font-bold text-gray-900">
              Workflow Run #{run.ID}
            </h1>

            <p className="text-gray-500 mt-2">
              Workflow execution detail
            </p>
          </div>

          <div
            className={`
              px-5
              py-3
              rounded-2xl
              text-white
              font-semibold

              ${
                run.Status === "SUCCESS"
                  ? "bg-green-500"
                  : run.Status === "FAILED"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }
            `}
          >
            {run.Status}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-3xl p-6">
            <p className="text-sm text-gray-500">
              Workflow ID
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {run.WorkflowID}
            </h3>
          </div>

          <div className="bg-white border rounded-3xl p-6">
            <p className="text-sm text-gray-500">
              Started
            </p>

            <h3 className="text-xl font-bold mt-2">
              {new Date(
                run.StartedAt * 1000
              ).toLocaleString()}
            </h3>
          </div>

          <div className="bg-white border rounded-3xl p-6">
            <p className="text-sm text-gray-500">
              Finished
            </p>

            <h3 className="text-xl font-bold mt-2">
              {new Date(
                run.EndedAt * 1000
              ).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* STEPS */}
        <div className="bg-white border rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Workflow Steps
          </h2>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.ID}
                className="
                  border
                  rounded-2xl
                  p-5
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {step.NodeID}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    {step.Logs}
                  </p>
                </div>

                <div
                  className={`
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-semibold
                    text-white

                    ${
                      step.Status ===
                      "SUCCESS"
                        ? "bg-green-500"
                        : step.Status ===
                          "FAILED"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }
                  `}
                >
                  {step.Status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}