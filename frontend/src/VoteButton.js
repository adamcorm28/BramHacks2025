import React from "react";

function VoteButton({func, direction}) {
    return <button style = {styles.controlButton} onClick={() => func(direction)}>{direction.toUpperCase()}</button>
}

const styles = {
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
}

export default VoteButton;
