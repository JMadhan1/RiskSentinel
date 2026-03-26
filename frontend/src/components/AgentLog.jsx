import { useEffect, useRef } from "react";

export function AgentLog({ logs }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-gray-950 text-green-400 font-mono text-xs rounded-xl p-4 h-48 overflow-y-auto">
      {(logs || []).map((line, i) => (
        <div key={i} className="mb-0.5">
          {line}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
