import React from "react";
import VoteButton from "./VoteButton";
import VideoStream from "./VideoStream";
import Countdown from "./Countdown";
import Timer from "./Countdown";
import bg from "./assets/bg3.jpg";
import "./fonts.css";
import noSignal from "./assets/no_signal.jpg";


function App() {
  const handleMove = (direction) => {
    fetch("http://127.0.0.1:8000/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error("Error:", err));
  };


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style = {styles.headerButton} onClick={() => {}}>Map</button>
        <h1 style={styles.title}>Wonder</h1>
        <button style = {styles.headerButton} onClick={() => {}}>Profile</button>
      </div>

      {/* <div style={styles.controls}>
        <VoteButton func = {handleMove} direction = "forward" />
        <div>
          <button onClick={() => handleMove("left")}>← Left</button>
          <button onClick={() => handleMove("stop")}>⏹ Stop</button>
          <button onClick={() => handleMove("right")}>→ Right</button>
        </div>
        <button onClick={() => handleMove("backward")}>↓ Backward</button>
      </div> */}

      <div style={styles.videoContainer}>

        <div style={styles.video}>
          <img
            src={VideoStream() || noSignal}
            alt={"No steam available"}
            style={{ width: "100%", borderRadius: "8px" }}
          />
          {/* <VideoStream /> */}
        </div>
        <div style={styles.timer}>{Timer()}</div>
      </div>
      <div style={styles.footer}>
        <button style = {styles.footerButton} onClick={() => {}}>Screenshot</button>
        <div style={styles.controls}>
          <button style = {styles.controlButton} onClick={() => handleMove("left")}>&lt;</button>
          <button style = {styles.controlButton} onClick={() => handleMove("forward")}>^</button>
          <button style = {styles.controlButton} onClick={() => handleMove("right")}>&gt;</button>
        </div>
        <button style = {styles.footerButton} onClick={() => {}}>Donate</button>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    textAlign: "center", 
    fontFamily: "sans-serif",
    marginTop: 0, 
    backgroundImage: `url(${bg})`,
    backgroundRepeat: "no-repeat", 
    backgroundSize: "cover",     
    position: "relative",
    // backgroundPosition: "20% 50%",
    // opacity: 0.5
    height: "100vh",
    minHeight: "100vh",
  },
  controls: { display: "inline-block", marginBottom: 40 },
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
    justifyContent: "space-between",
    alignItems: "center",
    width: "70vw",
    boxSizing: "border-box",
    padding: "5px",
    // backgroundColor: "#1e1e1e",
    color: "black",
    margin: "0 auto"
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
    alignItems: "center",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
  },
  timer: {
    fontSize: "5rem", 
    fontFamily: "CountdownFont, sans-serif", 
    color: `#FFEA00`,
    position: "absolute",  
    top: 0,
    // left: 0,
    right: 0,
    // bottom: 0,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    // alignItems: "flex-end",
    // justifyContent: "flex-start",
    // margin: "20px",
    // backgroundColor: "rgba(0, 0, 0, 0.2)", 
    zIndex: 2,
  }
};


export default App;
