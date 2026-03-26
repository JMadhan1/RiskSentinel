export function ActionPanel({ onScan, scanning, simulationMode }) {
  return (
    <div className="flex items-center gap-2">
      {simulationMode && (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
          Simulation Mode
        </span>
      )}
      <button
        onClick={onScan}
        disabled={scanning}
        className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {scanning ? "Scanning..." : "Check Now"}
      </button>
    </div>
  );
}
