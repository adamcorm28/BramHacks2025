import React, { useEffect, useState } from "react";
  
// function Countdown() {
//     const [countdown, setCountdown] = useState(5);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             fetch("http://127.0.0.1:8000/timer")
//                 .then(res => {
//                 if (!res.ok) throw new Error("Server not available");
//                 return res.json();
//                 })
//                 .then(data => setCountdown(data.remaining))
//                 .catch(() => {
//                     setCountdown("5");
//                 });
//         }, 1000);
//         return () => clearInterval(interval);
//     }, []);

//     return countdown
// }

//   export default Countdown;



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
