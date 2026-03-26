import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export function LiquidationCountdown({ positionIndex, riskLevel }) {
  const [seconds, setSeconds] = useState(null);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const resp = await axios.get(`${API}/api/countdown`);
        const entry = resp.data.countdowns[positionIndex];
        if (entry?.hours_to_liquidation != null) {
          setSeconds(Math.round(entry.hours_to_liquidation * 3600));
        } else {
          setSeconds(null);
        }
      } catch (e) {}
    };
    fetchCountdown();
    const interval = setInterval(fetchCountdown, 30000);
    return () => clearInterval(interval);
  }, [positionIndex]);

  // Live countdown tick
  useEffect(() => {
    if (seconds == null || seconds <= 0) return;
    const tick = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tick);
  }, [seconds]);

  if (seconds == null || riskLevel === "low") return null;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const display = `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;

  const colors = {
    critical: "bg-red-50 border-red-300 text-red-700",
    high: "bg-orange-50 border-orange-300 text-orange-700",
    medium: "bg-yellow-50 border-yellow-300 text-yellow-700",
  };

  return (
    <div className={`text-xs font-mono border rounded px-3 py-2 flex items-center gap-2 ${colors[riskLevel] || colors.medium}`}>
      <span className="animate-pulse">&#9888;</span>
      <span>
        Est. liquidation in: <strong>{seconds === 0 ? "IMMINENT" : display}</strong>
      </span>
    </div>
  );
}
