"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import RunCard from "@/components/RunCard";

import api from "@/lib/api";

interface WorkflowRun {
  ID: number;
  workflow_id: number;
  status: string;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<
    WorkflowRun[]
  >([]);

  const fetchRuns = async () => {
    try {
      const response = await api.get(
        "/workflow-runs"
      );

      setRuns(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRuns();

    const interval = setInterval(() => {
      fetchRuns();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800">
            Workflow Runs
          </h1>

          <p className="text-gray-500 mt-2">
            Monitor workflow execution history
          </p>
        </div>

        <div className="space-y-5">
          {runs.length > 0 ? (
            runs.map((run) => (
              <RunCard
                key={run.ID}
                id={run.ID}
                workflow_id={
                  run.workflow_id
                }
                status={run.status}
              />
            ))
          ) : (
            <div
              className="
                bg-white
                border
                border-dashed
                border-blue-200
                rounded-3xl
                p-12
                text-center
              "
            >
              <h3 className="text-2xl font-semibold text-gray-700">
                No workflow runs
              </h3>

              <p className="text-gray-500 mt-3">
                Run a workflow to see execution
                history.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}