export function AuditHistory({ entries }) {
  if (!entries?.length) return (
    <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
      No audit entries yet. Run a scan to generate the first log.
    </div>
  );

  return (
    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
      {entries.map((e, i) => {
        const isNew = i === 0;
        return (
          <div
            key={e.id || i}
            className={`border rounded-xl p-3 text-xs flex flex-col gap-1 shadow-sm transition-all ${
              isNew
                ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700"
                : "bg-white dark:bg-gray-800 dark:border-gray-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${isNew ? "text-purple-700 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"}`}>
                {isNew && "NEW "}{e.action?.action_type?.replace(/_/g, " ") || "action"}
              </span>
              <span className="text-gray-400">{new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {e.action?.position?.asset} —{" "}
              <span className={
                e.action?.risk?.level === "critical" ? "text-red-600 font-semibold" :
                e.action?.risk?.level === "high" ? "text-orange-600" : "text-gray-500"
              }>
                {e.action?.risk?.level} risk
              </span>
            </div>
            <div className="text-gray-400 font-mono truncate text-gray-400">
              wallet: {e.wallet_id}
            </div>
            {e.storacha_cid && (
              <a
                href={`https://ipfs.io/ipfs/${e.storacha_cid}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 mt-1 w-fit"
              >
                Verify on Filecoin
              </a>
            )}
            {e.lit_signature && (
              <div className="text-purple-500 dark:text-purple-400 truncate font-mono">
                Lit: {e.lit_signature.slice(0, 24)}...
              </div>
            )}
            {e.action?.near_tx_hash && (
              <a
                href={`https://explorer.testnet.near.org/transactions/${e.action.near_tx_hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 dark:text-teal-400 underline truncate hover:text-teal-800"
              >
                NEAR TX: {e.action.near_tx_hash.slice(0, 20)}...
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
