import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditDeck: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [decks, setDecks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecks = async () => {
      const response = await axios.get("https://100bwc-production.up.railway.app:3000/search-decks", {
        params: { keyword: keyword.toLowerCase(), page },
      });
      setDecks(response.data.decks);
      setTotal(response.data.total);
    };
    fetchDecks();
  }, [keyword, page]);

  const handleSelectDeck = (deckName: string) => {
    setSelectedDeck(deckName);
  };

  const handleSubmitPassword = async () => {
    const response = await axios.post("https://100bwc-production.up.railway.app:3000/validate-deck-password", {
      deckName: selectedDeck,
      editPassword,
    });
    if (response.data.success) {
      navigate("/deck-editing", { state: { deckName: selectedDeck, editPassword } });
    } else {
      alert(response.data.message);
    }
  };

  const handleReturn = () => {
    navigate("/edit-cards");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edit Deck</h1>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search Decks"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleReturn}
        >
          Return
        </button>
      </div>
      <div style={styles.deckList}>
        {decks.map((deck) => (
          <div key={deck.deckName} style={styles.deckItem}>
            <img src={`https://100bwc-production.up.railway.app:3000/decks/${deck.deckName}/important/${deck.thumbnail}`} alt="thumbnail" style={styles.thumbnail} />
            <div style={styles.deckInfo}>
              <h3>{deck.deckName}</h3>
              <p>{deck.description}</p>
            </div>
            <div style={styles.selectContainer}>
              {selectedDeck !== deck.deckName && (
                <button
                  onClick={() => handleSelectDeck(deck.deckName)}
                  style={styles.button}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
                >
                  Select
                </button>
              )}
              {selectedDeck === deck.deckName && (
                <div style={styles.passwordContainer}>
                  <input
                    type="password"
                    placeholder="Edit Password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    style={styles.input}
                  />
                  <button onClick={handleSubmitPassword} style={styles.submitButton}>
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={styles.pagination}>
        {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} style={styles.pageButton}>
            {i + 1}
          </button>
        ))}
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
    marginBottom: "20px",
    fontFamily: "Consolas, monospace", // Consolas font
    color: "#000", // Black text
    textShadow: "2px 2px #fff", // White shadow for blocky effect
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "2px solid #000",
    borderRadius: "5px",
    fontFamily: "Consolas, monospace",
    marginRight: "10px",
  },
  deckList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  deckItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "10px",
    borderBottom: "1px solid #000",
  },
  thumbnail: {
    width: "50px",
    height: "50px",
    marginRight: "10px",
  },
  deckInfo: {
    flex: 1,
    textAlign: "left",
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 5, // Allow descriptions to use 5 rows
    WebkitBoxOrient: "vertical",
  },
  selectContainer: {
    display: "flex",
    alignItems: "center",
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
  passwordContainer: {
    display: "flex",
    alignItems: "center",
    marginLeft: "10px",
  },
  submitButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ffcccc", // Very light red background
    color: "#000", // Black text
    border: "2px solid #000", // Black border
    borderRadius: "5px", // Curved corners
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontFamily: "Consolas, monospace",
    marginLeft: "10px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
  pageButton: {
    padding: "10px",
    fontSize: "1rem",
    margin: "0 5px",
    border: "2px solid #000",
    borderRadius: "5px",
    fontFamily: "Consolas, monospace",
  },
};

export default EditDeck;
