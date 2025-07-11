// File: src/components/settings/AccountActions.tsx
export const AccountActions = () => {
  const handleExportData = () => {
    console.log('Export data functionality coming soon')
  }

  const handleClearCache = () => {
    console.log('Clear cache functionality coming soon')
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
      <div className="space-y-3">
        <button
          onClick={handleExportData}
          className="w-full md:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition"
        >
          <i className="fas fa-download mr-2"></i>
          Export My Data
        </button>
        <button
          onClick={handleClearCache}
          className="w-full md:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition ml-0 md:ml-3"
        >
          <i className="fas fa-trash mr-2"></i>
          Clear Cache
        </button>
      </div>
    </div>
  )
}
