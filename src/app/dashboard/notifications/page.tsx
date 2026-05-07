export default function NotificationsModule() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh] p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Notifications</h2>
        <button className="text-blue-600 hover:underline text-sm font-medium transition-colors">
          Mark all as read
        </button>
      </div>
      <p className="text-gray-500">System alerts, updates, and messages will be listed here.</p>
    </div>
  );
}
