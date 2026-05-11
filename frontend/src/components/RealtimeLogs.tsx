"use client";

import { useEffect, useState } from "react";

interface EventLog {
  workflow_run_id?: number;
  step?: string;
  status?: string;
  message?: string;
}

export default function RealtimeLogs() {
  const [logs, setLogs] = useState<EventLog[]>(
    []
  );

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:8080/events"
    );

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setLogs((prev) => [
          data,
          ...prev,
        ]);
      } catch (error) {
        console.error(error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-blue-100
        p-6
        shadow-sm
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Realtime Execution Logs
          </h2>

          <p className="text-gray-500 mt-1">
            Live workflow execution events
          </p>
        </div>

        <div
          className={`
            px-4
            py-2
            rounded-2xl
            text-sm
            font-medium
            ${
              connected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }
          `}
        >
          {connected
            ? "Connected"
            : "Disconnected"}
        </div>
      </div>

      {/* LOGS */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {logs.length === 0 && (
          <div
            className="
              border
              border-dashed
              border-blue-200
              rounded-2xl
              p-10
              text-center
            "
          >
            <p className="text-gray-500">
              Waiting for workflow events...
            </p>
          </div>
        )}

        {logs.map((log, index) => (
          <div
            key={index}
            className="
              border
              border-blue-100
              rounded-2xl
              p-4
              bg-blue-50/40
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">
                  Workflow Run #
                  {log.workflow_run_id}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  Step: {log.step}
                </div>
              </div>

              <div
                className={`
                  px-3
                  py-1
                  rounded-xl
                  text-sm
                  font-medium
                  ${
                    log.status === "success"
                      ? "bg-green-100 text-green-700"
                      : log.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : log.status === "running"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }
                `}
              >
                {log.status || "queued"}
              </div>
            </div>

            {log.message && (
              <div className="mt-4 text-sm text-gray-700">
                {log.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
