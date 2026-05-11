"use client";

import { Search } from "lucide-react";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import WorkflowCard from "@/components/WorkflowCard";

interface WorkflowItem {
  ID: number;
  name: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<
    WorkflowItem[]
  >([]);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [search, setSearch] = useState("");

  const fetchWorkflows = async (
    page = 1,
    searchValue = ""
  ) => {
    try {
      const response = await api.get(
        `/workflows?page=${page}&search=${searchValue}`
      );

      setWorkflows(response.data.data);

      setMeta(response.data.meta);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f7fbff]">
      <Sidebar />

      <main className="flex-1">
        <Topbar />

        <div className="p-8">
          {/* SEARCH */}
          <div className="bg-white rounded-3xl border border-blue-100 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Search
                size={18}
                className="text-blue-500"
              />

              <input
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  fetchWorkflows(
                    1,
                    e.target.value
                  );
                }}
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl border border-blue-100 p-6">
              <p className="text-sm text-gray-500">
                Total Workflows
              </p>

              <h3 className="text-3xl font-bold text-blue-700 mt-2">
                {meta.total}
              </h3>
            </div>

            <div className="bg-white rounded-3xl border border-blue-100 p-6">
              <p className="text-sm text-gray-500">
                Current Page
              </p>

              <h3 className="text-3xl font-bold text-blue-700 mt-2">
                {meta.page}
              </h3>
            </div>

            <div className="bg-white rounded-3xl border border-blue-100 p-6">
              <p className="text-sm text-gray-500">
                Per Page
              </p>

              <h3 className="text-3xl font-bold text-blue-700 mt-2">
                {meta.limit}
              </h3>
            </div>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.ID}
                id={workflow.ID}
                name={workflow.name}
              />
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-8">
            <button
              disabled={meta.page <= 1}
              onClick={() =>
                fetchWorkflows(
                  meta.page - 1,
                  search
                )
              }
              className="bg-white border border-blue-100 px-5 py-2 rounded-2xl disabled:opacity-50"
            >
              Previous
            </button>

            <p className="text-gray-500">
              Page {meta.page}
            </p>

            <button
              disabled={
                meta.page * meta.limit >=
                meta.total
              }
              onClick={() =>
                fetchWorkflows(
                  meta.page + 1,
                  search
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-2xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}