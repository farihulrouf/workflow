import {
  LayoutDashboard,
  Workflow,
  PlayCircle,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-blue-100 flex flex-col">
      <div className="p-6 border-b border-blue-100">
        <h1 className="text-2xl font-bold text-blue-700">
          FlowForge
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Workflow Platform
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-700 font-medium">
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition text-gray-700">
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
  );
}