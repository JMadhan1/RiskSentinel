export function RiskGauge({ level, score }) {
  const colors = {
    low: "bg-green-500",
    medium: "bg-yellow-400",
    high: "bg-orange-500",
    critical: "bg-red-600 animate-pulse",
  };
  const pct = Math.round((score || 0) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span className="capitalize font-semibold">{level || "—"}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${colors[level] || "bg-gray-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
