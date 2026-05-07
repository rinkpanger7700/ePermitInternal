export default function InspectionsModule() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh] p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Site Inspections</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Schedule Inspection
        </button>
      </div>
      <p className="text-gray-500">Inspection schedules, reports, and inspector assignments will be displayed here.</p>
    </div>
  );
}
