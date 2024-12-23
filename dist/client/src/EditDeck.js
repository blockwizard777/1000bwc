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
const EditDeck = () => {
    const [keyword, setKeyword] = (0, react_1.useState)("");
    const [decks, setDecks] = (0, react_1.useState)([]);
    const [page, setPage] = (0, react_1.useState)(1);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [selectedDeck, setSelectedDeck] = (0, react_1.useState)(null);
    const [editPassword, setEditPassword] = (0, react_1.useState)("");
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        const fetchDecks = () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield axios_1.default.get("http://localhost:3000/search-decks", {
                params: { keyword: keyword.toLowerCase(), page },
            });
            setDecks(response.data.decks);
            setTotal(response.data.total);
        });
        fetchDecks();
    }, [keyword, page]);
    const handleSelectDeck = (deckName) => {
        setSelectedDeck(deckName);
    };
    const handleSubmitPassword = () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield axios_1.default.post("http://localhost:3000/validate-deck-password", {
            deckName: selectedDeck,
            editPassword,
        });
        if (response.data.success) {
            navigate("/deck-editing", { state: { deckName: selectedDeck, editPassword } });
        }
        else {
            alert(response.data.message);
        }
    });
    const handleReturn = () => {
        navigate("/edit-cards");
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: styles.container, children: [(0, jsx_runtime_1.jsx)("h1", { style: styles.title, children: "Edit Deck" }), (0, jsx_runtime_1.jsxs)("div", { style: styles.searchContainer, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search Decks", value: keyword, onChange: (e) => setKeyword(e.target.value), style: styles.input }), (0, jsx_runtime_1.jsx)("button", { style: styles.button, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || ''), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || ''), onClick: handleReturn, children: "Return" })] }), (0, jsx_runtime_1.jsx)("div", { style: styles.deckList, children: decks.map((deck) => ((0, jsx_runtime_1.jsxs)("div", { style: styles.deckItem, children: [(0, jsx_runtime_1.jsx)("img", { src: `http://localhost:3000/decks/${deck.deckName}/important/${deck.thumbnail}`, alt: "thumbnail", style: styles.thumbnail }), (0, jsx_runtime_1.jsxs)("div", { style: styles.deckInfo, children: [(0, jsx_runtime_1.jsx)("h3", { children: deck.deckName }), (0, jsx_runtime_1.jsx)("p", { children: deck.description })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.selectContainer, children: [selectedDeck !== deck.deckName && ((0, jsx_runtime_1.jsx)("button", { onClick: () => handleSelectDeck(deck.deckName), style: styles.button, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || ''), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || ''), children: "Select" })), selectedDeck === deck.deckName && ((0, jsx_runtime_1.jsxs)("div", { style: styles.passwordContainer, children: [(0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "Edit Password", value: editPassword, onChange: (e) => setEditPassword(e.target.value), style: styles.input }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSubmitPassword, style: styles.submitButton, children: "Submit" })] }))] })] }, deck.deckName))) }), (0, jsx_runtime_1.jsx)("div", { style: styles.pagination, children: Array.from({ length: Math.ceil(total / 20) }, (_, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setPage(i + 1), style: styles.pageButton, children: i + 1 }, i))) })] }));
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
        backgroundColor: "#ccc", // Grey shade on hover
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
exports.default = EditDeck;
