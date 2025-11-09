import React, { useEffect, useState } from "react";

function VideoStream() {
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/livestream");
    socket.onmessage = (event) => {
      setImageSrc(`data:image/jpeg;base64,${event.data}`);
    };
    socket.onclose = () => {
        console.log("WebSocket opened");
    };
    socket.onclose = () => {
        console.log("WebSocket closed");
        setImageSrc("");
    };
    socket.onerror = (err) => console.error("WebSocket error:", err);

    return () => socket.close();
    }, []);

  return imageSrc || ""
}

export default VideoStream;
