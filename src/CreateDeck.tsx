import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateDeck: React.FC = () => {
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [usagePassword, setUsagePassword] = useState("");
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/edit-cards");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (thumbnail && thumbnail.size > 2 * 1024 * 1024) {
      alert("Thumbnail size exceeds 2MB. Please choose another image.");
      return;
    }

    if (deckName.toLowerCase() === "main" || deckName.toLowerCase() === "discard") {
      alert("Deck name cannot be 'main' or 'discard'. Please choose another name.");
      return;
    }

    const formData = new FormData();
    formData.append("deckName", deckName);
    formData.append("description", description);
    if (thumbnail) formData.append("thumbnail", thumbnail); // Remove the third parameter
    formData.append("editPassword", editPassword);
    formData.append("isPublic", isPublic.toString());
    if (!isPublic) formData.append("usagePassword", usagePassword);

    try {
      const response = await axios.post("https://100bwc-xi.vercel.app//create-deck", formData);
      if (response.data.success) {
        navigate("/edit-cards");
      } else {
        alert("Deck name already in use.");
      }
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Deck</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Deck Name"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={styles.textarea}
        />
        <label style={styles.label}>Thumbnail image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)}
          style={styles.fileInput}
        />
        <input
          type="password"
          placeholder="Editing Password"
          value={editPassword}
          onChange={(e) => setEditPassword(e.target.value)}
          required
          style={styles.input}
        />
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={styles.checkbox}
          />
          Public
        </label>
        {!isPublic && (
          <input
            type="password"
            placeholder="Usage Password"
            value={usagePassword}
            onChange={(e) => setUsagePassword(e.target.value)}
            required
            style={styles.input}
          />
        )}
        <button type="submit" style={styles.button}>
          Create Deck
        </button>
      </form>
      <button
        style={styles.button}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
        onClick={handleReturn}
      >
        Return
      </button>
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
    height: "100px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: "Consolas, monospace",
    color: "#000",
  },
  checkbox: {
    transform: "scale(1.5)",
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
};

export default CreateDeck;
