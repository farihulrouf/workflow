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
  const [logs, setLogs] = useState<EventData[]>([]);
  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    console.log("CONNECTING SSE...");

    const eventSource = new EventSource(
      "http://localhost:8080/events"
    );

    // ==========================================
    // CONNECTED
    // ==========================================

    eventSource.onopen = () => {
      console.log("SSE CONNECTED");

      setConnected(true);
    };

    // ==========================================
    // MESSAGE
    // ==========================================

    eventSource.onmessage = (event) => {
      console.log(
        "RAW SSE EVENT:",
        event.data
      );

      try {
        const data = JSON.parse(event.data);

        console.log(
          "PARSED SSE EVENT:",
          data
        );

        setLogs((prev) => [data, ...prev]);
      } catch (err) {
        console.error(
          "SSE Parse Error:",
          err
        );
      }
    };

    // ==========================================
    // ERROR
    // ==========================================

    eventSource.onerror = (err) => {
      console.error("SSE ERROR:", err);

      setConnected(false);
    };

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      console.log("SSE CLOSED");

      eventSource.close();
    };
  }, []);

  return (
    <div className="bg-white border rounded-3xl p-6">
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

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
          <div
            className={`
              w-2
              h-2
              rounded-full
              animate-pulse
              ${
                connected
                  ? "bg-green-500"
                  : "bg-red-500"
              }
            `}
          />

          <span
            className={`
              text-sm
              font-medium
              ${
                connected
                  ? "text-green-600"
                  : "text-red-600"
              }
            `}
          >
            {connected
              ? "LIVE"
              : "DISCONNECTED"}
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* EMPTY */}
      {/* ========================================== */}

      {logs.length === 0 && (
        <div
          className="
            border
            border-dashed
            rounded-2xl
            p-10
            text-center
            text-gray-500
          "
        >
          No realtime events yet...
        </div>
      )}

      {/* ========================================== */}
      {/* LOGS */}
      {/* ========================================== */}

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {logs.map((log, index) => (
          <div
            key={index}
            className="
              border
              rounded-2xl
              p-4
              bg-gray-50
            "
          >
            <div className="flex items-center justify-between gap-4">
              {/* LEFT */}
              <div>
                <div className="font-semibold text-slate-800">
                  {log.step || "WORKFLOW"}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  {log.message}
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  Run ID:{" "}
                  {log.workflow_run_id}
                </div>
              </div>

              {/* STATUS */}
              <div
                className={`
                  px-3
                  py-1
                  rounded-xl
                  text-sm
                  font-medium
                  whitespace-nowrap

                  ${
                    log.status ===
                    "success"
                      ? "bg-green-100 text-green-700"
                      : ""
                  }

                  ${
                    log.status ===
                    "running"
                      ? "bg-blue-100 text-blue-700"
                      : ""
                  }

                  ${
                    log.status ===
                    "failed"
                      ? "bg-red-100 text-red-700"
                      : ""
                  }

                  ${
                    log.status ===
                    "completed"
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