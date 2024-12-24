import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const LobbyScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomName, username, players: initialPlayers, isHost } = location.state;
  const [players, setPlayers] = useState<any[]>(initialPlayers);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [infiniteMode, setInfiniteMode] = useState(false);
  const [blankCards, setBlankCards] = useState(0);
  const [chaosMode, setChaosMode] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<any[]>([]);
  const [additionalDecks, setAdditionalDecks] = useState<any[]>([]);
  const [showDeckSearch, setShowDeckSearch] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [usagePassword, setUsagePassword] = useState("");
  const [settingsPosition, setSettingsPosition] = useState({ top: 50, left: 80 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [addingToAdditionalDecks, setAddingToAdditionalDecks] = useState(false);
  const [totalCards, setTotalCards] = useState(0); // Add state for total cards
  const [selectedDeckInfo, setSelectedDeckInfo] = useState<any>(null); // Add state for selected deck info

  useEffect(() => {
    const newSocket = io("https://100bwc-xi.vercel.app/");
    setSocket(newSocket);

    console.log("Joining room:", roomName, "with username:", username);
    newSocket.emit("joinRoom", { roomName, username, isHost: false });

    newSocket.on("updateRoom", (roomState) => {
      console.log("Updated room state:", roomState);
      setPlayers(roomState.players);
      // Update username if it was changed by the server
      const currentPlayer = roomState.players.find((player: any) => player.id === newSocket.id);
      if (currentPlayer && currentPlayer.username !== username) {
        location.state.username = currentPlayer.username;
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomName, username]);

  const handleInfiniteModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfiniteMode(e.target.checked);
  };

  const handleBlankCardsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setBlankCards(value >= 0 ? value : 0); // Ensure the value is never negative
  };

  const handleChaosModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChaosMode(e.target.checked);
  };

  const handleAddDecksClick = () => {
    setShowDeckSearch(true);
    setAddingToAdditionalDecks(false);
  };

  const handleAddAdditionalDecksClick = () => {
    setShowDeckSearch(true);
    setAddingToAdditionalDecks(true);
  };

  const handleSelectDeck = async (deck: any) => {
    if (deck.isPublic) {
      if (addingToAdditionalDecks) {
        setAdditionalDecks((prevAdditionalDecks) => [...prevAdditionalDecks, { ...deck, id: uuidv4() }]);
      } else {
        setSelectedDecks((prevSelectedDecks) => [...prevSelectedDecks, { ...deck, id: uuidv4() }]);
        setTotalCards((prevTotal) => prevTotal + Number(deck.cardCount)); // Ensure cardCount is a number
      }
    } else {
      const password = prompt("Enter usage password:");
      if (password) {
        const response = await axios.post("https://100bwc-xi.vercel.app//validate-usage-password", {
          deckName: deck.deckName,
          usagePassword: password,
        });
        if (response.data.success) {
          if (addingToAdditionalDecks) {
            setAdditionalDecks((prevAdditionalDecks) => [...prevAdditionalDecks, { ...deck, id: uuidv4() }]);
          } else {
            setSelectedDecks((prevSelectedDecks) => [...prevSelectedDecks, { ...deck, id: uuidv4() }]);
            setTotalCards((prevTotal) => prevTotal + Number(deck.cardCount)); // Ensure cardCount is a number
          }
        } else {
          alert(response.data.message);
        }
      }
    }
  };

  const handleRemoveDeck = (deckId: string) => {
    const deckToRemove = selectedDecks.find(deck => deck.id === deckId);
    if (deckToRemove) {
      setTotalCards((prevTotal) => prevTotal - Number(deckToRemove.cardCount)); // Ensure cardCount is a number
    }
    setSelectedDecks((prevSelectedDecks) => prevSelectedDecks.filter(deck => deck.id !== deckId));
  };

  const handleRemoveAdditionalDeck = (deckId: string) => {
    setAdditionalDecks((prevAdditionalDecks) => prevAdditionalDecks.filter(deck => deck.id !== deckId));
  };

  const handleReturnFromDeckSearch = () => {
    setShowDeckSearch(false);
  };

  useEffect(() => {
    const fetchDecks = async () => {
      const response = await axios.get("https://100bwc-xi.vercel.app//search-decks", {
        params: { keyword: keyword.toLowerCase(), page },
      });
      const decksWithInfo = await Promise.all(response.data.decks.map(async (deck: any) => {
        const deckInfoResponse = await axios.get("https://100bwc-xi.vercel.app//deck-info", {
          params: { deckName: deck.deckName },
        });
        return { 
          ...deck, 
          isPublic: deckInfoResponse.data.deckInfo.isPublic, 
          starred: deckInfoResponse.data.deckInfo.starred, 
          cardCount: deckInfoResponse.data.deckInfo.cardCount,
          description: deckInfoResponse.data.deckInfo.description // Ensure full description is included
        };
      }));
      setDecks(decksWithInfo);
      setTotal(response.data.total);
    };
    fetchDecks();
  }, [keyword, page]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setDragStart({ x: e.clientX - settingsPosition.left, y: e.clientY - settingsPosition.top });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setSettingsPosition({
        left: e.clientX - dragStart.x,
        top: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleStartGame = () => {
    if (socket) {
      socket.emit("startGame", { roomName, selectedDecks, additionalDecks, infiniteMode, chaosMode, blankCards });
      navigate("/game", { state: { roomName, username, isHost } }); // Pass isHost to the game screen
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("gameStarted", () => {
        console.log("Game started, joining game...");
        socket.emit("joinGame", { roomName, username });
        navigate("/game", { state: { roomName, username, players } });
      });
    }
  }, [socket, navigate, roomName, username, players]);

  const handleDisconnect = () => {
    // Implement the logic to disconnect and return to the main menu
    console.log("Disconnecting...");
    if (socket) {
      socket.emit("leaveRoom", { roomName });
      socket.disconnect();
    }
    navigate("/");
  };

  const handleHostRoom = () => {
    if (socket) {
      socket.emit("hostRoom", { username });
      socket.on("roomCreated", ({ roomName, roomState }) => {
        navigate("/lobby", { state: { roomName, username, players: roomState.players, isHost: true } }); // Pass isHost: true
      });
    }
  };

  const handleExpandDeck = (deck: any) => {
    setSelectedDeckInfo(deck);
  };

  const handleCloseDeckInfo = () => {
    setSelectedDeckInfo(null);
  };

  const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseDeckInfo();
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f0f0f0", // Off-white background
      textAlign: "center",
      border: "2px solid #000", // Black border
      borderRadius: "15px", // Curved corners
      padding: "20px",
      fontFamily: "Consolas, monospace", // Consolas font
      minWidth: "550px", // Set the minimum width to 550px
      overflowY: "auto", // Allow vertical scrolling
    },
    title: {
      fontSize: "2.5rem",
      marginBottom: "20px",
      fontFamily: "Consolas, monospace", // Consolas font
      color: "#000", // Black text
      textShadow: "2px 2px #fff", // White shadow for blocky effect
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
      fontFamily: "Consolas, monospace", // Consolas font,
    },
    list: {
      listStyleType: "none",
      padding: 0,
    },
    listItem: {
      fontSize: "1.5rem",
      marginBottom: "10px",
      fontFamily: "Consolas, monospace", // Consolas font
      color: "#000", // Black text
      textShadow: "1px 1px #fff", // White shadow for blocky effect
    },
    settingsContainer: {
      position: "fixed", // Change to fixed to prevent overlap
      top: `${settingsPosition.top}px`,
      left: `${settingsPosition.left}px`,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      backgroundColor: "#fff",
      padding: "10px",
      border: "2px solid #000",
      borderRadius: "10px",
      zIndex: 1000,
      maxWidth: "400px", // Allow it to be considerably wider
      cursor: dragging ? "grabbing" : "grab",
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
      position: "relative",
    },
    checkbox: {
      marginRight: "10px",
    },
    tooltip: {
      marginLeft: "10px",
      fontSize: "0.8rem",
      color: "#666",
    },
    numberInputLabel: {
      display: "flex",
      alignItems: "center",
    },
    numberInput: {
      marginLeft: "10px",
      padding: "5px",
      fontSize: "1rem",
      border: "2px solid #000",
      borderRadius: "5px",
      outline: "none",
      width: "60px",
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
      marginBottom: "10px",
    },
    additionalButton: {
      padding: "10px 20px",
      fontSize: "1rem",
      backgroundColor: "#fff", // White background
      color: "#000", // Black text
      border: "2px solid #000", // Black border
      borderRadius: "5px", // Curved corners
      cursor: "pointer",
      transition: "background-color 0.3s",
      fontFamily: "Consolas, monospace", // Consolas font
      marginBottom: "10px",
    },
    deckList: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      marginTop: "10px",
    },
    additionalDeckList: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      marginTop: "10px",
    },
    deckItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    thumbnail: {
      width: "30px",
      height: "30px",
      marginRight: "10px",
    },
    removeButton: {
      marginRight: "10px", // Move to the left side
      backgroundColor: "#ff6666", // Light red background
      color: "#fff", // White text
      border: "2px solid #000", // Black border
      borderRadius: "5px", // Curved corners
      cursor: "pointer",
      transition: "background-color 0.3s",
      fontFamily: "Consolas, monospace", // Consolas font
    },
    deckSearchContainer: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      padding: "20px",
      border: "2px solid #000",
      borderRadius: "10px",
      zIndex: 2000,
      width: "40%", // Decrease the width
      maxHeight: "80%",
      overflowY: "auto",
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    deckSearchInput: {
      padding: "10px",
      fontSize: "1rem",
      marginBottom: "10px",
      border: "2px solid #000",
      borderRadius: "5px",
      fontFamily: "Consolas, monospace",
      width: "100%",
    },
    deckSearchList: {
      listStyleType: "none",
      padding: 0,
    },
    deckSearchItem: {
      display: "flex",
      alignItems: "center",
      padding: "10px",
      borderBottom: "1px solid #000",
    },
    deckSearchButton: {
      padding: "12px 24px", // Increase padding
      fontSize: "1.1rem", // Increase font size
      borderRadius: "5px",
      cursor: "pointer",
      transition: "background-color 0.3s",
      fontFamily: "Consolas, monospace",
      marginRight: "10px",
    },
    publicDeckButton: {
      backgroundColor: "#ccffcc",
      color: "#000",
      border: "2px solid #000",
      marginRight: "10px",
      padding: "12px 24px", // Increase padding
      fontSize: "1.1rem", // Increase font size
    },
    privateDeckButton: {
      backgroundColor: "#ff9999",
      color: "#000",
      border: "2px solid #000",
      marginRight: "10px",
      padding: "12px 24px", // Increase padding
      fontSize: "1.1rem", // Increase font size
    },
    deckThumbnail: {
      width: "40px", // Increase thumbnail size
      height: "40px",
      marginRight: "10px",
    },
    deckNameText: {
      flex: 1,
      textAlign: "left",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "200px", // Set a maximum width for the deck name
    },
    startButton: {
      padding: "15px 30px",
      fontSize: "1.5rem",
      backgroundColor: "#f0fff0", // Light lime background
      color: "#000", // Black text
      border: "2px solid #000", // Black border
      borderRadius: "10px", // Curved corners
      cursor: "pointer",
      transition: "background-color 0.3s",
      fontFamily: "Consolas, monospace", // Consolas font
      marginBottom: "20px",
    },
    disconnectButton: {
      padding: "10px 20px",
      fontSize: "1rem",
      backgroundColor: "#ffcccc", // Light red background
      color: "#000", // Black text
      border: "2px solid #000", // Black border
      borderRadius: "5px", // Curved corners
      cursor: "pointer",
      transition: "background-color 0.3s",
      fontFamily: "Consolas, monospace", // Consolas font
      marginTop: "20px",
    },
    expandButton: {
      marginLeft: "10px",
      padding: "5px 10px",
      fontSize: "0.8rem",
      backgroundColor: "#ddd",
      border: "1px solid #000",
      borderRadius: "5px",
      cursor: "pointer",
    },
    deckInfoOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000,
    },
    deckInfoPopup: {
      backgroundColor: "#fff",
      padding: "20px",
      border: "2px solid #000",
      borderRadius: "10px",
      width: "400px",
      textAlign: "center",
    },
    enlargedThumbnail: {
      width: "100px",
      height: "100px",
      marginBottom: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lobby: {roomName}</h1>
      {isHost && (
        <button style={styles.startButton} onClick={handleStartGame}>
          Start Game
        </button>
      )}
      <h3>Players in the Lobby:</h3>
      <ul style={styles.list}>
        {players.map((player: any, index: number) => (
          <li key={index} style={styles.listItem}>{player.username}</li>
        ))}
      </ul>
      {isHost && (
        <div
          style={styles.settingsContainer}
          onMouseDown={handleMouseDown}
        >
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={infiniteMode}
              onChange={handleInfiniteModeChange}
              style={styles.checkbox}
            />
            Infinite Mode
            <span style={styles.tooltip}>does not remove cards from decks when drawn</span>
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={chaosMode}
              onChange={handleChaosModeChange}
              style={styles.checkbox}
            />
            CHAOS MODE
            <span style={styles.tooltip}>use ALL public decks</span>
          </label>
          <label style={styles.numberInputLabel}>
            Blank Cards:
            <input
              type="number"
              value={blankCards}
              onChange={handleBlankCardsChange}
              style={styles.numberInput}
            />
          </label>
          <button style={styles.button} onClick={handleAddDecksClick}>
            Add Decks
          </button>
          <p style={{ margin: 0 }}>Total Cards: {totalCards}</p> {/* Display total cards */}
          <div style={styles.deckList}>
            {selectedDecks.map((deck) => (
              <div key={deck.id} style={styles.deckItem}>
                <button style={styles.removeButton} onClick={() => handleRemoveDeck(deck.id)}>X</button>
                <img src={`https://100bwc-xi.vercel.app//decks/${deck.deckName}/important/${deck.thumbnail}`} alt="thumbnail" style={styles.thumbnail} />
                <span style={styles.deckNameText}>{deck.deckName}</span>
              </div>
            ))}
          </div>
          <button style={styles.additionalButton} onClick={handleAddAdditionalDecksClick}>
            Add Additional Decks
          </button>
          <div style={styles.additionalDeckList}>
            {additionalDecks.map((deck) => (
              <div key={deck.id} style={styles.deckItem}>
                <button style={styles.removeButton} onClick={() => handleRemoveAdditionalDeck(deck.id)}>X</button>
                <img src={`https://100bwc-xi.vercel.app//decks/${deck.deckName}/important/${deck.thumbnail}`} alt="thumbnail" style={styles.thumbnail} />
                <span style={styles.deckNameText}>{deck.deckName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {showDeckSearch && (
        <div style={styles.deckSearchContainer}>
          <div style={styles.searchContainer}>
            <button style={styles.button} onClick={handleReturnFromDeckSearch}>
              Return
            </button>
            <input
              type="text"
              placeholder="Search Decks"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={styles.deckSearchInput}
            />
          </div>
          <ul style={styles.deckSearchList}>
            {decks.map((deck, index) => (
              <li key={deck.deckName} style={{ ...styles.deckSearchItem, fontWeight: index % 2 === 0 ? 'bold' : 'normal' }}>
                <button
                  style={deck.isPublic ? styles.publicDeckButton : styles.privateDeckButton}
                  onClick={() => handleSelectDeck(deck)}
                >
                  Select
                </button>
                {deck.starred && <span style={{ marginRight: "5px" }}>⭐</span>}
                <img src={`https://100bwc-xi.vercel.app//decks/${deck.deckName}/important/${deck.thumbnail}`} alt="thumbnail" style={styles.deckThumbnail} />
                <span style={styles.deckNameText}>{deck.deckName}</span>
                <button style={styles.expandButton} onClick={() => handleExpandDeck(deck)}>Expand</button>
              </li>
            ))}
          </ul>
          <div style={styles.pagination}>
            {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={styles.pageButton}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedDeckInfo && (
        <div style={styles.deckInfoOverlay} onClick={handlePopupClick}>
          <div style={styles.deckInfoPopup}>
            <h2>{selectedDeckInfo.deckName}</h2>
            <img src={`https://100bwc-xi.vercel.app//decks/${selectedDeckInfo.deckName}/important/${selectedDeckInfo.thumbnail}`} alt="thumbnail" style={styles.enlargedThumbnail} />
            <p>{selectedDeckInfo.description}</p>
          </div>
        </div>
      )}
      <button style={styles.disconnectButton} onClick={handleDisconnect}>
        Disconnect
      </button>
    </div>
  );
};

export default LobbyScreen;