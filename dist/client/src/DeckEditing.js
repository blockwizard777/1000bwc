"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const DeckEditing = () => {
    const location = (0, react_router_dom_1.useLocation)();
    const { deckName, editPassword } = location.state;
    const [description, setDescription] = (0, react_1.useState)("");
    const [cards, setCards] = (0, react_1.useState)([]);
    const [existingCards, setExistingCards] = (0, react_1.useState)([]);
    const [selectedCard, setSelectedCard] = (0, react_1.useState)(null);
    const [additionalFiles, setAdditionalFiles] = (0, react_1.useState)([]);
    const [cardDescription, setCardDescription] = (0, react_1.useState)("");
    const [cardValues, setCardValues] = (0, react_1.useState)([]);
    const [additionalCards, setAdditionalCards] = (0, react_1.useState)([]);
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        const fetchDeckInfo = () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield axios_1.default.get("http://localhost:3000/deck-info", {
                params: { deckName },
            });
            if (response.data.success) {
                const deckInfo = response.data.deckInfo;
                setDescription(deckInfo.description);
            }
            else {
                alert(response.data.message);
                navigate("/edit-deck");
            }
        });
        const fetchDeckCards = () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield axios_1.default.get("http://localhost:3000/deck-cards", {
                params: { deckName },
            });
            if (response.data.success) {
                setExistingCards(response.data.files);
            }
            else {
                alert(response.data.message);
            }
        });
        fetchDeckInfo();
        fetchDeckCards();
    }, [deckName, navigate]);
    const handleAddCard = (e) => {
        if (e.target.files) {
            setCards([...cards, ...Array.from(e.target.files)]);
        }
    };
    const handleAddAdditionalFiles = (e) => {
        if (e.target.files) {
            setAdditionalFiles([...additionalFiles, ...Array.from(e.target.files)]);
        }
    };
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const formData = new FormData();
        formData.append("deckName", deckName);
        formData.append("editPassword", editPassword);
        formData.append("description", description);
        formData.append("cardCount", existingCards.length.toString()); // Add card count
        cards.forEach((card) => formData.append("cards", card));
        try {
            const response = yield axios_1.default.post("http://localhost:3000/edit-deck", formData);
            if (response.data.success) {
                alert("Deck updated successfully.");
                navigate("/edit-deck");
            }
            else {
                alert(response.data.message);
            }
        }
        catch (error) {
            console.error("Error updating deck:", error);
        }
    });
    const handleUpload = () => __awaiter(void 0, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append("deckName", deckName);
        cards.forEach((card) => formData.append("cards", card));
        try {
            const response = yield axios_1.default.post("http://localhost:3000/upload-cards", formData);
            if (response.data.success) {
                alert("Cards uploaded successfully.");
                setCards([]);
                const updatedDeckCards = yield axios_1.default.get("http://localhost:3000/deck-cards", {
                    params: { deckName },
                });
                setExistingCards(updatedDeckCards.data.files);
            }
            else {
                alert(response.data.message);
            }
        }
        catch (error) {
            console.error("Error uploading cards:", error);
        }
    });
    const handleSelectCard = (filename) => __awaiter(void 0, void 0, void 0, function* () {
        setSelectedCard(filename);
        setCardDescription("");
        setCardValues([]);
        const response = yield axios_1.default.get("http://localhost:3000/card-info", {
            params: { deckName, cardName: filename },
        });
        if (response.data.success) {
            const cardData = response.data.cardInfo;
            setCardDescription(cardData.description);
            setCardValues(cardData.values);
            setAdditionalCards(cardData.additional);
        }
        else {
            alert(response.data.message);
        }
    });
    const handleDeleteCard = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield axios_1.default.post("http://localhost:3000/delete-card", { deckName, cardName: selectedCard });
            setExistingCards(existingCards.filter(card => card !== selectedCard));
            setSelectedCard(null);
        }
        catch (error) {
            console.error("Error deleting card:", error);
        }
    });
    const handleDeleteCardAndJson = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield axios_1.default.post("http://localhost:3000/delete-card-and-json", { deckName, cardName: selectedCard });
            setExistingCards(existingCards.filter(card => card !== selectedCard));
            setSelectedCard(null);
        }
        catch (error) {
            console.error("Error deleting card and JSON:", error);
        }
    });
    const handleDeleteAdditionalCard = (filename) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("http://localhost:3000/remove-additional-card", {
                deckName,
                cardName: selectedCard,
                additionalCardName: filename,
            });
            if (response.data.success) {
                setAdditionalCards(additionalCards.filter(card => card !== filename));
            }
            else {
                alert(response.data.message);
            }
        }
        catch (error) {
            console.error("Error deleting additional card:", error);
        }
    });
    const handleSaveCard = () => __awaiter(void 0, void 0, void 0, function* () {
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
            const response = yield axios_1.default.post("http://localhost:3000/save-card", formData);
            if (response.data.success) {
                alert("Card saved successfully.");
                setSelectedCard(null);
                setCardDescription("");
                setCardValues([]);
                setAdditionalFiles([]);
            }
            else {
                alert(response.data.message);
            }
        }
        catch (error) {
            console.error("Error saving card:", error);
        }
    });
    const handleUploadAdditionalFiles = () => __awaiter(void 0, void 0, void 0, function* () {
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
            const response = yield axios_1.default.post("http://localhost:3000/save-card", formData);
            if (response.data.success) {
                alert("Additional files uploaded successfully.");
                setAdditionalFiles([]);
                setSelectedCard(null);
                setCardDescription("");
                setCardValues([]);
                const updatedDeckCards = yield axios_1.default.get("http://localhost:3000/deck-cards", {
                    params: { deckName },
                });
                setExistingCards(updatedDeckCards.data.files);
            }
            else {
                alert(response.data.message);
            }
        }
        catch (error) {
            console.error("Error uploading additional files:", error);
        }
    });
    const handleAddValue = () => {
        setCardValues([...cardValues, 0]);
    };
    const handleRemoveValue = () => {
        setCardValues(cardValues.slice(0, -1));
    };
    const handleValueChange = (index, value) => {
        const newValues = [...cardValues];
        newValues[index] = value;
        setCardValues(newValues);
    };
    const handleReturn = () => {
        navigate("/edit-deck");
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: styles.container, children: [!selectedCard && ((0, jsx_runtime_1.jsxs)("h1", { style: styles.title, children: ["Edit Deck: ", deckName] })), !selectedCard && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, style: styles.form, children: [(0, jsx_runtime_1.jsx)("textarea", { placeholder: "Description", value: description, onChange: (e) => setDescription(e.target.value), required: true, style: styles.textarea }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: handleAddCard, style: styles.fileInput }), (0, jsx_runtime_1.jsxs)("div", { style: styles.buttonContainer, children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", style: styles.saveChangesButton, children: "Save Changes" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleUpload, style: styles.uploadButton, children: "Upload" })] })] }), (0, jsx_runtime_1.jsx)("div", { style: styles.cardGrid, children: existingCards.map((filename) => {
                            const imageUrl = `http://localhost:3000/decks/${deckName}/cards/${filename}`;
                            console.log("Image URL:", imageUrl); // Add console log to check the image URL
                            return ((0, jsx_runtime_1.jsxs)("div", { style: styles.cardItem, onClick: () => handleSelectCard(filename), children: [(0, jsx_runtime_1.jsx)("img", { src: imageUrl, alt: "card", style: styles.cardImage }), (0, jsx_runtime_1.jsx)("p", { children: filename })] }, filename));
                        }) })] })), selectedCard && ((0, jsx_runtime_1.jsx)("div", { style: styles.cardEditor, children: (0, jsx_runtime_1.jsxs)("div", { style: styles.cardEditorContent, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.buttonContainerTop, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleSaveCard, style: styles.saveButton, children: "Save Card" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setSelectedCard(null), style: styles.button, children: "Return" })] }), (0, jsx_runtime_1.jsx)("img", { src: `http://localhost:3000/decks/${deckName}/cards/${selectedCard}`, alt: "card", style: styles.cardImageLarge }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Description", value: cardDescription, onChange: (e) => setCardDescription(e.target.value), required: true, style: styles.cardTextarea }), (0, jsx_runtime_1.jsxs)("div", { style: styles.fileInputContainer, children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: handleAddAdditionalFiles, style: styles.fileInput }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleUploadAdditionalFiles, style: styles.uploadButton, children: "Upload Additional Files" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.valuesContainer, children: [cardValues.map((value, index) => ((0, jsx_runtime_1.jsx)("input", { type: "number", value: value, onChange: (e) => handleValueChange(index, parseInt(e.target.value)), style: styles.valueInput }, index))), (0, jsx_runtime_1.jsxs)("div", { style: styles.buttonContainer, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleAddValue, style: styles.button, children: "Add Value" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleRemoveValue, style: styles.button, children: "Remove Value" })] })] }), (0, jsx_runtime_1.jsx)("div", { style: styles.buttonContainer, children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleDeleteCardAndJson, style: styles.deleteButton, children: "Delete Card" }) }), (0, jsx_runtime_1.jsxs)("div", { style: styles.additionalCardsContainer, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Additional Cards:" }), (0, jsx_runtime_1.jsx)("div", { style: styles.additionalCardsGrid, children: additionalCards.map((filename) => {
                                        const imageUrl = `http://localhost:3000/decks/${deckName}/additional/${filename}`;
                                        return ((0, jsx_runtime_1.jsxs)("div", { style: styles.cardItem, children: [(0, jsx_runtime_1.jsx)("img", { src: imageUrl, alt: "additional card", style: styles.cardImage }), (0, jsx_runtime_1.jsx)("p", { children: filename }), (0, jsx_runtime_1.jsx)("button", { style: styles.deleteButton, onClick: () => handleDeleteAdditionalCard(filename), children: "Delete" })] }, filename));
                                    }) })] })] }) })), !selectedCard && ((0, jsx_runtime_1.jsx)("button", { style: Object.assign(Object.assign({}, styles.button), { marginTop: "20px" }), onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || ''), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || ''), onClick: handleReturn, children: "Return" }))] }));
};
const styles = {
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
        backgroundColor: "#ccc", // Grey shade on hover
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
exports.default = DeckEditing;
