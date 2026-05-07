export default function ApprovalsModule() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh] p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Pending Approvals</h2>
      </div>
      <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 text-sm">
        You have 12 items pending your approval.
      </div>
      <p className="text-gray-500">Board resolutions, final evaluations, and director approvals will be displayed here.</p>
    </div>
  );
}
