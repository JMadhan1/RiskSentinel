import { useState } from "react";

export function ExplainabilityPanel({ reasoning, action }) {
  const [open, setOpen] = useState(false);

  if (!reasoning) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-blue-500 underline flex items-center gap-1 hover:text-blue-700"
      >
        {open ? "▲" : "▼"} Why did the AI decide this?
      </button>
      {open && (
        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 leading-relaxed dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
          <div className="font-semibold mb-1">AI Reasoning:</div>
          <div>{reasoning}</div>
          {action && (
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">
              <span className="font-semibold">Decision:</span>{" "}
              {action.replace(/_/g, " ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
