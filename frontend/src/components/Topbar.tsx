import { Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-blue-100 flex items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Workflows
        </h2>

        <p className="text-gray-500 text-sm">
          Manage automation workflows
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
  );
}