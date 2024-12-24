import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const DeckEditing: React.FC = () => {
  const location = useLocation();
  const { deckName, editPassword } = location.state;
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<File[]>([]);
  const [existingCards, setExistingCards] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [cardDescription, setCardDescription] = useState("");
  const [cardValues, setCardValues] = useState<number[]>([]);
  const [additionalCards, setAdditionalCards] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeckInfo = async () => {
      const response = await axios.get("https://100bwc-xi.vercel.app//deck-info", {
        params: { deckName },
      });
      if (response.data.success) {
        const deckInfo = response.data.deckInfo;
        setDescription(deckInfo.description);
      } else {
        alert(response.data.message);
        navigate("/edit-deck");
      }
    };

    const fetchDeckCards = async () => {
      const response = await axios.get("https://100bwc-xi.vercel.app//deck-cards", {
        params: { deckName },
      });
      if (response.data.success) {
        setExistingCards(response.data.files);
      } else {
        alert(response.data.message);
      }
    };

    fetchDeckInfo();
    fetchDeckCards();
  }, [deckName, navigate]);

  const handleAddCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCards([...cards, ...Array.from(e.target.files)]);
    }
  };

  const handleAddAdditionalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalFiles([...additionalFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("deckName", deckName);
    formData.append("editPassword", editPassword);
    formData.append("description", description);
    formData.append("cardCount", existingCards.length.toString()); // Add card count
    cards.forEach((card) => formData.append("cards", card));

    try {
      const response = await axios.post("https://100bwc-xi.vercel.app//edit-deck", formData);
      if (response.data.success) {
        alert("Deck updated successfully.");
        navigate("/edit-deck");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error updating deck:", error);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("deckName", deckName);
    cards.forEach((card) => formData.append("cards", card));

    try {
      const response = await axios.post("https://100bwc-xi.vercel.app//upload-cards", formData);
      if (response.data.success) {
        alert("Cards uploaded successfully.");
        setCards([]);
        const updatedDeckCards = await axios.get("https://100bwc-xi.vercel.app//deck-cards", {
          params: { deckName },
        });
        setExistingCards(updatedDeckCards.data.files);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading cards:", error);
    }
  };

  const handleSelectCard = async (filename: string) => {
    setSelectedCard(filename);
    setCardDescription("");
    setCardValues([]);
    const response = await axios.get("https://100bwc-xi.vercel.app//card-info", {
      params: { deckName, cardName: filename },
    });
    if (response.data.success) {
      const cardData = response.data.cardInfo;
      setCardDescription(cardData.description);
      setCardValues(cardData.values);
      setAdditionalCards(cardData.additional);
    } else {
      alert(response.data.message);
    }
  };

  const handleDeleteCard = async () => {
    try {
      await axios.post("https://100bwc-xi.vercel.app//delete-card", { deckName, cardName: selectedCard });
      setExistingCards(existingCards.filter(card => card !== selectedCard));
      setSelectedCard(null);
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleDeleteCardAndJson = async () => {
    try {
      await axios.post("https://100bwc-xi.vercel.app//delete-card-and-json", { deckName, cardName: selectedCard });
      setExistingCards(existingCards.filter(card => card !== selectedCard));
      setSelectedCard(null);
    } catch (error) {
      console.error("Error deleting card and JSON:", error);
    }
  };

  const handleDeleteAdditionalCard = async (filename: string) => {
    try {
      const response = await axios.post("https://100bwc-xi.vercel.app//remove-additional-card", {
        deckName,
        cardName: selectedCard,
        additionalCardName: filename,
      });
      if (response.data.success) {
        setAdditionalCards(additionalCards.filter(card => card !== filename));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting additional card:", error);
    }
  };

  const handleSaveCard = async () => {
    const formData = new FormData();
    formData.append("deckName", deckName);
    formData.append("cardName", selectedCard);
    formData.append("description", cardDescription);
    formData.append("values", JSON.stringify(cardValues));
    additionalFiles.forEach((file) => formData.append("additionalFiles", file));

    try {
      console.log("Sending save-card request:", {
        deckName,
        cardName: selectedCard,
        description: cardDescription,
        values: cardValues,
        additionalFiles,
      });
      const response = await axios.post("https://100bwc-xi.vercel.app//save-card", formData);
      if (response.data.success) {
        alert("Card saved successfully.");
        setSelectedCard(null);
        setCardDescription("");
        setCardValues([]);
        setAdditionalFiles([]);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error saving card:", error);
    }
  };

  const handleUploadAdditionalFiles = async () => {
    const formData = new FormData();
    formData.append("deckName", deckName);
    formData.append("cardName", selectedCard);
    formData.append("description", cardDescription);
    formData.append("values", JSON.stringify(cardValues));
    additionalFiles.forEach((file) => formData.append("additionalFiles", file));

    try {
      console.log("Sending upload additional files request:", {
        deckName,
        cardName: selectedCard,
        description: cardDescription,
        values: cardValues,
        additionalFiles,
      });
      const response = await axios.post("https://100bwc-xi.vercel.app//save-card", formData);
      if (response.data.success) {
        alert("Additional files uploaded successfully.");
        setAdditionalFiles([]);
        setSelectedCard(null);
        setCardDescription("");
        setCardValues([]);
        const updatedDeckCards = await axios.get("https://100bwc-xi.vercel.app//deck-cards", {
          params: { deckName },
        });
        setExistingCards(updatedDeckCards.data.files);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading additional files:", error);
    }
  };

  const handleAddValue = () => {
    setCardValues([...cardValues, 0]);
  };

  const handleRemoveValue = () => {
    setCardValues(cardValues.slice(0, -1));
  };

  const handleValueChange = (index: number, value: number) => {
    const newValues = [...cardValues];
    newValues[index] = value;
    setCardValues(newValues);
  };

  const handleReturn = () => {
    navigate("/edit-deck");
  };

  return (
    <div style={styles.container}>
      {!selectedCard && (
        <h1 style={styles.title}>Edit Deck: {deckName}</h1>
      )}
      {!selectedCard && (
        <>
          <form onSubmit={handleSubmit} style={styles.form}>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={styles.textarea}
            />
            <input type="file" accept="image/*" multiple onChange={handleAddCard} style={styles.fileInput} />
            <div style={styles.buttonContainer}>
              <button type="submit" style={styles.saveChangesButton}>
                Save Changes
              </button>
              <button type="button" onClick={handleUpload} style={styles.uploadButton}>
                Upload
              </button>
            </div>
          </form>
          <div style={styles.cardGrid}>
            {existingCards.map((filename) => {
              const imageUrl = `https://100bwc-xi.vercel.app//decks/${deckName}/cards/${filename}`;
              console.log("Image URL:", imageUrl); // Add console log to check the image URL
              return (
                <div key={filename} style={styles.cardItem} onClick={() => handleSelectCard(filename)}>
                  <img src={imageUrl} alt="card" style={styles.cardImage} />
                  <p>{filename}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
      {selectedCard && (
        <div style={styles.cardEditor}>
          <div style={styles.cardEditorContent}>
            <div style={styles.buttonContainerTop}>
              <button type="button" onClick={handleSaveCard} style={styles.saveButton}>
                Save Card
              </button>
              <button type="button" onClick={() => setSelectedCard(null)} style={styles.button}>
                Return
              </button>
            </div>
            <img src={`https://100bwc-xi.vercel.app//decks/${deckName}/cards/${selectedCard}`} alt="card" style={styles.cardImageLarge} />
            <textarea
              placeholder="Description"
              value={cardDescription}
              onChange={(e) => setCardDescription(e.target.value)}
              required
              style={styles.cardTextarea}
            />
            <div style={styles.fileInputContainer}>
              <input type="file" accept="image/*" multiple onChange={handleAddAdditionalFiles} style={styles.fileInput} />
              <button type="button" onClick={handleUploadAdditionalFiles} style={styles.uploadButton}>
                Upload Additional Files
              </button>
            </div>
            <div style={styles.valuesContainer}>
              {cardValues.map((value, index) => (
                <input
                  key={index}
                  type="number"
                  value={value}
                  onChange={(e) => handleValueChange(index, parseInt(e.target.value))}
                  style={styles.valueInput}
                />
              ))}
              <div style={styles.buttonContainer}>
                <button type="button" onClick={handleAddValue} style={styles.button}>
                  Add Value
                </button>
                <button type="button" onClick={handleRemoveValue} style={styles.button}>
                  Remove Value
                </button>
              </div>
            </div>
            <div style={styles.buttonContainer}>
              <button type="button" onClick={handleDeleteCardAndJson} style={styles.deleteButton}>
                Delete Card
              </button>
            </div>
            <div style={styles.additionalCardsContainer}>
              <h3>Additional Cards:</h3>
              <div style={styles.additionalCardsGrid}>
                {additionalCards.map((filename) => {
                  const imageUrl = `https://100bwc-xi.vercel.app//decks/${deckName}/additional/${filename}`;
                  return (
                    <div key={filename} style={styles.cardItem}>
                      <img src={imageUrl} alt="additional card" style={styles.cardImage} />
                      <p>{filename}</p>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteAdditionalCard(filename)}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {!selectedCard && (
        <button
          style={{ ...styles.button, marginTop: "20px" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleReturn}
        >
          Return
        </button>
      )}
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
    overflowX: "hidden", // Disable horizontal scrolling
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
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  textarea: {
    padding: "10px",
    fontSize: "1rem",
    marginBottom: "10px",
    border: "2px solid #f0f0f0",
    borderRadius: "5px",
    outline: "none",
    backgroundColor: "#333",
    color: "#fff",
    fontFamily: "Consolas, monospace",
    width: "100%",
    height: "150px", // Ensure the height of the deck description box
  },
  cardTextarea: {
    padding: "10px",
    fontSize: "1rem",
    marginBottom: "10px",
    border: "2px solid #f0f0f0",
    borderRadius: "5px",
    outline: "none",
    backgroundColor: "#333",
    color: "#fff",
    fontFamily: "Consolas, monospace",
    width: "100%",
    height: "125px", // Decrease the height of the selected card description box to 1/2 of its current size
    resize: "vertical", // Allow resizing in the y-axis
    overflow: "auto", // Ensure overflow is handled within the text area
  },
  fileInput: {
    padding: "10px",
    fontSize: "1rem",
    marginBottom: "10px",
    border: "2px solid #f0f0f0", // Off-white border
    borderRadius: "5px", // Curved corners
    outline: "none",
    backgroundColor: "#fff", // White background
    color: "#000", // Black text
    fontFamily: "Consolas, monospace", // Consolas font
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
  },
  buttonContainerTop: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
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
  uploadButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ffcccc", // Very light red background
    color: "#000", // Black text
    border: "2px solid #000", // Black border
    borderRadius: "5px", // Curved corners
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontFamily: "Consolas, monospace", // Consolas font
  },
  deleteButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ff6666", // Light red background
    color: "#000", // Black text
    border: "2px solid #000", // Black border
    borderRadius: "5px", // Curved corners
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontFamily: "Consolas, monospace", // Consolas font
  },
  saveButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#f0fff0", // White-lime background
    color: "#000", // Black text
    border: "2px solid #000", // Black border
    borderRadius: "5px", // Curved corners
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontFamily: "Consolas, monospace", // Consolas font
  },
  saveChangesButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#f0fff0", // Light lime background
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
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10px",
    width: "100%",
    marginTop: "20px",
    zIndex: 20, // Ensure cards are above other elements
  },
  cardItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    border: "1px solid #000",
    borderRadius: "5px",
    cursor: "pointer",
    zIndex: 20, // Ensure cards are above other elements
  },
  cardImage: {
    width: "100px",
    height: "100px",
    marginBottom: "10px",
    zIndex: 20, // Ensure cards are above other elements
  },
  cardImageLarge: {
    width: "200px",
    height: "200px",
    marginBottom: "10px",
  },
  cardEditor: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    overflowY: "auto", // Allow vertical scrolling when a card is selected
    maxHeight: "calc(3/5 * 100vh)", // Limit the height to 3/5 of the screen height
    overflowX: "hidden", // Disable horizontal scrolling
  },
  cardEditorContent: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  valuesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  valueInput: {
    padding: "10px",
    fontSize: "1rem",
    marginBottom: "10px",
    border: "2px solid #f0f0f0", // Off-white border
    borderRadius: "5px", // Curved corners
    outline: "none",
    backgroundColor: "#fff", // White background
    color: "#000", // Black text
    fontFamily: "Consolas, monospace", // Consolas font
  },
  additionalCardsContainer: {
    marginTop: "20px",
    width: "100%",
  },
  additionalCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10px",
    width: "100%",
  },
  fileInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

export default DeckEditing;

