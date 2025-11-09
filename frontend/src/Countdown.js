import React, { useEffect, useState } from "react";



function Timer() {
  const [remaining, setRemaining] = useState(5.0);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/timer");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRemaining(data.remaining);
    };

    ws.onclose = () => console.warn("Timer socket closed");
    ws.onerror = (err) => console.error("Timer socket error:", err);

    return () => ws.close();
  }, []);

  return remaining.toFixed(2)
}

export default Timer;
