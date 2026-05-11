"use client";

import { useEffect, useState } from "react";

interface EventData {
  workflow_run_id: number;
  step: string;
  status: string;
  message: string;
  timestamp: number;
}

export default function WorkflowRealtimeViewer() {
  const [logs, setLogs] = useState<EventData[]>(
    []
  );

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:8080/events"
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setLogs((prev) => [data, ...prev]);
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="bg-white border rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">
            Live Workflow Events
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            realtime execution monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

          <span className="text-sm text-green-600">
            LIVE
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {logs.map((log, index) => (
          <div
            key={index}
            className="border rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {log.step || "WORKFLOW"}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  {log.message}
                </div>
              </div>

              <div
                className={`
                  px-3 py-1 rounded-xl text-sm font-medium
                  ${
                    log.status === "success"
                      ? "bg-green-100 text-green-700"
                      : ""
                  }
                  ${
                    log.status === "running"
                      ? "bg-blue-100 text-blue-700"
                      : ""
                  }
                  ${
                    log.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : ""
                  }
                  ${
                    log.status === "completed"
                      ? "bg-purple-100 text-purple-700"
                      : ""
                  }
                `}
              >
                {log.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}