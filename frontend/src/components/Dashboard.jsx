import { PositionCard } from "./PositionCard";
import { AgentLog } from "./AgentLog";
import { AuditTrail } from "./AuditTrail";
import { ActionPanel } from "./ActionPanel";

export function Dashboard({ positions, risks, logs, audits, wsStatus, onScan, scanning, simulationMode }) {
  const wsColor =
    wsStatus === "connected"
      ? "bg-green-400"
      : wsStatus === "connecting"
      ? "bg-yellow-400"
      : "bg-red-400";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RiskSentinel</h1>
            <p className="text-sm text-gray-500">
              Autonomous DeFi Risk Monitor · NEAR Testnet
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${wsColor}`}></span>
            <span className="text-xs text-gray-400">{wsStatus}</span>
            <ActionPanel
              onScan={onScan}
              scanning={scanning}
              simulationMode={simulationMode}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Positions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-700">Monitored Positions</h2>
            {positions.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-12 border-2 border-dashed rounded-xl">
                Waiting for first scan...
              </div>
            )}
            {positions.map((pos, i) => (
              <PositionCard key={i} position={pos} risk={risks[i]} />
            ))}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-semibold text-gray-700 mb-2">Agent Log</h2>
              <AgentLog logs={logs} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-700 mb-2">
                Verifiable Audit Trail
              </h2>
              <AuditTrail entries={audits} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
