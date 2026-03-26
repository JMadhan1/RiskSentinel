import { useState, useEffect, useRef } from "react";

export function useWebSocket(url) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("connecting");
  const wsRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setStatus("connected");
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        setData(msg);
      };
      ws.onclose = () => {
        setStatus("disconnected");
        setTimeout(connect, 3000);
      };
      ws.onerror = () => setStatus("error");
    };
    connect();
    return () => wsRef.current?.close();
  }, [url]);

  return { data, status };
}
