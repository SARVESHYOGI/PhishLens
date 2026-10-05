export function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Scan</h3>
          <p className="text-gray-600 mb-4">Scan a URL for phishing threats</p>
          <a href="/scanner" className="text-blue-600 hover:text-blue-500 font-medium">
            Start Scan →
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan History</h3>
          <p className="text-gray-600 mb-4">View your past scan results</p>
          <a href="/history" className="text-blue-600 hover:text-blue-500 font-medium">
            View History →
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-600 mb-4">Configure your preferences</p>
          <a href="/settings" className="text-blue-600 hover:text-blue-500 font-medium">
            Open Settings →
          </a>
        </div>
      </div>
    </div>
  );
}