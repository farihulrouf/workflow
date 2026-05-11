interface WorkflowCardProps {
  id: number;
  name: string;
}

export default function WorkflowCard({
  id,
  name,
}: WorkflowCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-blue-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Workflow ID: {id}
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-2xl transition">
          Open
        </button>
      </div>
    </div>
  );
}