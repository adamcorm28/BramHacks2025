import React, { useEffect, useState, useRef } from "react";
import VoteButton from "./VoteButton";
import VideoStream from "./VideoStream";
import Countdown from "./Countdown";
import Timer from "./Countdown";
import bg from "./assets/bg3.jpg";
import "./fonts.css";
import noSignal from "./assets/no_signal.jpg";
import circleImgs from "./assets/circleButtons.png";
import circle2 from "./assets/circleButton2.png";
import donateBtn from "./assets/donate_btn.png";
import chatIcon from "./assets/wonder.png";



function App() {
  const [chatOpen, setChatOpen] = useState(false);

  const chatBodyRef = useRef(null);

  const [activeDir, setActiveDir] = useState(null);


  const handleChatToggle = () => setChatOpen(!chatOpen);

  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi, I'm Wonder Rover! I’m currently 1,320 km into my journey across the moon, and I’m thrilled to have you join. You can help decide my next route - donations cast direction votes, and all proceeds go towards future space exploration. You can take screenshots and track my location on the live map. Feel free to ask me anything about space!" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "d") {
        fetch("http://127.0.0.1:8000/toggle_detection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
          .then((res) => res.json())
          .then((data) => console.log("Detection:", data.detection_enabled))
          .catch((err) => console.error("Error toggling detection:", err));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);




  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
    }
  };






const handleMove = (direction) => {
  setActiveDir(direction); 

  fetch("http://127.0.0.1:8000/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      // optional: clear highlight after movement finishes
      setTimeout(() => setActiveDir(null), 8500);
    })
    .catch((err) => console.error("Error:", err));
};



  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style = {styles.headerButton} onClick={() => {}}>Map</button>
        <h1 style={styles.title}>Wonder</h1>
        <button style = {styles.headerButton} onClick={() => {}}>Profile</button>
      </div>


      <div style={styles.main}>
        <div
          style={{
            ...styles.videoGroup,
            transform: chatOpen
              ? "translate(calc(-50% - 250px), -51%)"
              : "translate(-50%, -51%)",
          }}
        >
          <div style={styles.videoContainer}>
            <div style={styles.video}>
              <img
                src={VideoStream() || noSignal}
                alt="No stream available"
                style={{ width: "100%", borderRadius: "8px" }}
              />
            </div>
            <div style={styles.timer}>{Timer()}</div>
            <svg
              style={styles.overlay}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Line 1 - Left */}
              <line x1="30" y1="100" x2="10" y2="65" stroke="#EFE8F6" strokeWidth="0.5" class="dashed-line" strokeDasharray="1" opacity={activeDir && (activeDir === "forward" || activeDir === "right") ? 0 : 0.6}/>
              <circle cx="8" cy="60" r="3" fill="#EFE8F6" opacity={activeDir && (activeDir === "forward" || activeDir === "right") ? 0 : 0.6} />

              {/* Line 2 - Middle */}
              <line x1="50" y1="100" x2="50" y2="65" stroke="#FEE32C" strokeWidth="0.5" class="dashed-line" strokeDasharray="1" opacity={activeDir && (activeDir === "left" || activeDir === "right") ? 0 : 0.6}/>
              <circle cx="50" cy="60" r="3" fill="#FEE32C" opacity={activeDir && (activeDir === "left" || activeDir === "right") ? 0 : 0.6}/>

              {/* Line 3 - Right */}
              <line x1="70" y1="100" x2="90" y2="65" stroke="#247CD2" strokeWidth="0.5" class="dashed-line" strokeDasharray="1" opacity={activeDir && (activeDir === "forward" || activeDir === "left") ? 0 : 0.6}/>
              <circle cx="92" cy="60" r="3" fill="#247CD2" opacity={activeDir && (activeDir === "forward" || activeDir === "left") ? 0 : 0.6}/>
            </svg>
          </div>

          <div style={styles.controlsRow}>
            <button style={{
              ...styles.circleButton1,
              opacity: activeDir && activeDir !== "left" ? 0.4 : 1,
            }} onClick={() => handleMove("left")}>
            </button>
            <button style={{
              ...styles.circleButton2,
              opacity: activeDir && activeDir !== "forward" ? 0.4 : 1,
            }} onClick={() => handleMove("forward")}>
            </button>
            <button style={{
              ...styles.circleButton3,
              opacity: activeDir && activeDir !== "right" ? 0.4 : 1,
            }} onClick={() => handleMove("right")}>
            </button>
          </div>
        </div>
        {!chatOpen && (
          <img
            src={chatIcon}
            alt="Open chat"
            style={styles.chatIcon}
            onClick={handleChatToggle}
          />
        )}
      </div>




      <div
        style={{
          ...styles.chatPanel,
          transform: chatOpen ? "translateX(0)" : "translateX(calc(100% + 60px))",
        }}
      >
        <div style={styles.chatHeader}>
          <h2 style={styles.chatTitle}>Chat</h2>
          <button style={styles.closeChatBtn} onClick={handleChatToggle}>
            ✖
          </button>
        </div>
        <div style={styles.chatBody} ref={chatBodyRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.chatMessage,
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "user" ? "#FFEA00" : "#333",
                color: msg.sender === "user" ? "#000" : "#fff",
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div style={styles.chatInputArea}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={styles.chatInput}
          />
          <button style={styles.sendButton} onClick={handleSend}>
            Send
          </button>
        </div>

      </div>
      
      <button style = {styles.donateButton} onClick={() => {}}></button>
    </div>
  );
}

const styles = {
  container: { 
    height: "100vh",
    overflow: "hidden",
    textAlign: "center", 
    fontFamily: "sans-serif",
    marginTop: 0, 
    backgroundImage: `url(${bg})`,
    backgroundRepeat: "no-repeat", 
    backgroundSize: "cover",     
    position: "relative",
    // backgroundPosition: "20% 50%",
    // opacity: 0.5
    minHeight: "100vh",
  },
  controls: { display: "inline-block", justifyContent: "center", },
  video: { 
    display: "flex", 
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
    padding: "5px 20px",
    // backgroundColor: "#1e1e1e",
    color: "black",
  },
  headerButton: {
    background: "#3c3c3c",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: 70,
    height: 70,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    opacity: 0
  },
  title: {
    color: `#FFEA00`,
    fontFamily: "SpaceAge, sans-serif",
    fontSize: "120px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    textShadow: "3px 10px 10px #333"
  },
  footer: {
    display: "flex",
    flexDirection: "column",      
    alignItems: "center",       
    justifyContent: "center",     
    gap: "20px",                
    width: "100%",                 
    marginTop: "20px",
  },
  footerButton: {
    background: "#3c3c3c",
    color: "white",
    border: "none",
    borderRadius: "20px",
    width: 200,
    height: 70,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  controlButton: {
    background: "#3c3c3c",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: 50,
    height: 50,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  videoContainer: {
    position: "relative",
    width: "65vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
  },

  timer: {
    fontSize: "5rem", 
    fontFamily: "CountdownFont, sans-serif", 
    color: `#FFEA00`,
    position: "absolute",  
    top: 0,
    right: 0,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    zIndex: 2,
  },
  circleButton1: {
    width: "60px",             
    height: "60px",
    borderRadius: "50%",      
    border: "none",
    backgroundImage: `url(${circleImgs})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "550% 200%",      
    backgroundPosition: "73% 100%",   
    cursor: "pointer",
    opacity: {}
  },
  circleButton2: {
    width: "60px",                
    height: "60px",
    borderRadius: "50%",         
    border: "none",
    backgroundImage: `url(${circleImgs})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "550% 200%",      
    backgroundPosition: "51% 0%", 
    cursor: "pointer",
  },
  circleButton3: {
    width: "60px",                
    height: "60px",
    borderRadius: "50%",         
    border: "none",
    backgroundImage: `url(${circleImgs})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "550% 200%",      
    backgroundPosition: "5% 95%", 
    cursor: "pointer",
  },
  donateButton: {
    position: "fixed",        
    bottom: "20px",       
    left: "50%",              
    transform: "translateX(-50%)",  
    width: "180px",
    height: "60px",
    borderRadius: "100%",
    border: "none",
    backgroundImage: `url(${donateBtn})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover", 
    backgroundPosition: "center",
    cursor: "pointer",
    zIndex: 10,                
  },



  chatButton: {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    cursor: "pointer",
    zIndex: 5,
  },
  chatPanel: {
    position: "fixed",
    top: "15%",
    right: "40px", 
    transform: "translateY(-50%)", 
    width: "350px",
    height: "65%",
    backgroundColor: "rgba(30,30,30,0.95)",
    color: "#fff",
    boxShadow: "0 0 15px rgba(0,0,0,0.5)",
    transition: "transform 0.4s ease",
    padding: "20px",
    zIndex: 4,
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column", 
    justifyContent: "space-between", 
  },
  chatTitle: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  chatBody: {
    overflowY: "auto",
    height: "80%",
  },
  chatInputArea: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "10px",
},

chatInput: {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #555",
  backgroundColor: "#222",
  color: "#fff",
  outline: "none",
  fontSize: "1rem",
},

sendButton: {
  padding: "10px 15px",
  borderRadius: "10px",
  backgroundColor: "#FFEA00",
  border: "none",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.2s",
},
controlsRow: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "120px",
},
main: {
  position: "relative",
  width: "100%",
  height: "calc(100vh - 200px)", 
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
},

videoGroup: {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  transition: "transform 0.5s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
},
chatMessage: {
  maxWidth: "75%",
  padding: "10px 14px",
  borderRadius: "12px",
  margin: "6px 0",
  wordWrap: "break-word",
  fontSize: "1.2rem",
  lineHeight: "1.4",
  fontFamily: "CountdownFont"
},
chatIcon: {
  position: "absolute",
  bottom: "80px",     
  right: "-105px",  
  width: "400px",      
  height: "300px",
  cursor: "pointer",
  zIndex: 5,
  transition: "opacity 0.3s ease, transform 0.3s ease",
  borderRadius: "50%", 
},

chatHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
},

closeChatBtn: {
  background: "none",
  border: "none",
  color: "#FFEA00",
  fontSize: "1.3rem",
  cursor: "pointer",
  transition: "0.2s",
},
closeChatBtnHover: {
  color: "#fff",
},
overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none", 
  },
};


export default App;

