import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const MainMenu: React.FC = () => {
  const [username, setUsername] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io("https://100bwc-xi.vercel.app/");
    setSocket(newSocket);

    // Clean up the socket connection on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (username.trim() === "") {
      alert("Username cannot be empty or spaces only.");
      return;
    }
    if (socket) {
      console.log("Joining room:", lobbyCode);
      socket.emit("joinRoom", { roomName: lobbyCode, username, isHost: false });

      socket.on("updateRoom", (roomState) => {
        console.log("Updated room state:", roomState);
        navigate("/lobby", { state: { roomName: lobbyCode, username, players: roomState.players, isHost: false } });
      });
    }
  };

  const handleHost = () => {
    if (username.trim() === "") {
      alert("Username cannot be empty or spaces only.");
      return;
    }
    if (socket) {
      console.log("Hosting room with username:", username);
      socket.emit("hostRoom", { username });

      socket.on("roomCreated", ({ roomName, roomState }) => {
        console.log("Room created:", roomName);
        setLobbyCode(roomName);
        navigate("/lobby", { state: { roomName, username, players: roomState.players, isHost: true } });
      });
    }
  };

  const handleEditCards = () => {
    navigate("/edit-cards");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>1000 Blank White Cards</h1>
      <h2 style={styles.subtitle}>sub 2 CowboyNumber4 on YT</h2>
      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Enter Lobby Code"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value)}
        style={styles.input}
      />
      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleJoin}
        >
          Join Game
        </button>
        <button
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleHost}
        >
          Host Game
        </button>
        <button
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleEditCards}
        >
          Edit Cards
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(3/5 * 100vh)", // Set the minimum height to 3/5 of the screen height
    minWidth: "550px", // Set the minimum width to 550px
    margin: "calc(1/5 * 100vh) 0", // Set the top and bottom margin to 1/5 of the screen height
    backgroundColor: "#f0f0f0", // Off-white background
    textAlign: "center",
    border: "2px solid #000", // Black border
    borderRadius: "15px", // Curved corners
    padding: "20px",
    fontFamily: "Consolas, monospace", // Consolas font
    boxSizing: "border-box", // Include padding and border in the element's total width and height
    overflowY: "auto", // Allow vertical scrolling
    zIndex: 10, // Ensure the frame is behind the main menu
    position: "relative", // Ensure z-index works
  },
  title: {
    fontSize: "2.5rem", // Adjust font size to fit better
    marginBottom: "5px", // Reduce space between title and subtitle
    fontFamily: "Consolas, monospace", // Consolas font
    color: "#000", // Black text
    textShadow: "2px 2px #fff", // White shadow for blocky effect
  },
  subtitle: {
    fontSize: "1rem",
    marginBottom: "20px",
    fontFamily: "Consolas, monospace", // Consolas font
    color: "#000", // Black text
    textShadow: "1px 1px #fff", // White shadow for blocky effect
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    marginBottom: "10px",
    border: "2px solid #f0f0f0", // Off-white border
    borderRadius: "5px", // Curved corners
    outline: "none",
    backgroundColor: "#333", // Off-black background
    color: "#fff", // White text
    fontFamily: "Consolas, monospace", // Consolas font
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px", // Small gap between buttons
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#fff", // White background
    color: "#000", // Black text
    border: "2px solid #000", // Black border
    borderRadius: "5px", // Curved corners
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontFamily: "Consolas, monospace", // Consolas font
  },
  buttonHover: {
    backgroundColor: "#ccc" as string, // Grey shade on hover
  },
};

export default MainMenu;
