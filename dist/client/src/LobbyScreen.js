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
const socket_io_client_1 = require("socket.io-client");
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const LobbyScreen = () => {
    const location = (0, react_router_dom_1.useLocation)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { roomName, username, players: initialPlayers, isHost } = location.state;
    const [players, setPlayers] = (0, react_1.useState)(initialPlayers);
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [infiniteMode, setInfiniteMode] = (0, react_1.useState)(false);
    const [blankCards, setBlankCards] = (0, react_1.useState)(0);
    const [chaosMode, setChaosMode] = (0, react_1.useState)(false);
    const [decks, setDecks] = (0, react_1.useState)([]);
    const [selectedDecks, setSelectedDecks] = (0, react_1.useState)([]);
    const [additionalDecks, setAdditionalDecks] = (0, react_1.useState)([]);
    const [showDeckSearch, setShowDeckSearch] = (0, react_1.useState)(false);
    const [keyword, setKeyword] = (0, react_1.useState)("");
    const [page, setPage] = (0, react_1.useState)(1);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [usagePassword, setUsagePassword] = (0, react_1.useState)("");
    const [settingsPosition, setSettingsPosition] = (0, react_1.useState)({ top: 50, left: 80 });
    const [dragging, setDragging] = (0, react_1.useState)(false);
    const [dragStart, setDragStart] = (0, react_1.useState)({ x: 0, y: 0 });
    const [addingToAdditionalDecks, setAddingToAdditionalDecks] = (0, react_1.useState)(false);
    const [totalCards, setTotalCards] = (0, react_1.useState)(0); // Add state for total cards
    const [selectedDeckInfo, setSelectedDeckInfo] = (0, react_1.useState)(null); // Add state for selected deck info
    (0, react_1.useEffect)(() => {
        const newSocket = (0, socket_io_client_1.io)("http://localhost:3000");
        setSocket(newSocket);
        console.log("Joining room:", roomName, "with username:", username);
        newSocket.emit("joinRoom", { roomName, username, isHost: false });
        newSocket.on("updateRoom", (roomState) => {
            console.log("Updated room state:", roomState);
            setPlayers(roomState.players);
            // Update username if it was changed by the server
            const currentPlayer = roomState.players.find((player) => player.id === newSocket.id);
            if (currentPlayer && currentPlayer.username !== username) {
                location.state.username = currentPlayer.username;
            }
        });
        return () => {
            newSocket.disconnect();
        };
    }, [roomName, username]);
    const handleInfiniteModeChange = (e) => {
        setInfiniteMode(e.target.checked);
    };
    const handleBlankCardsChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setBlankCards(value >= 0 ? value : 0); // Ensure the value is never negative
    };
    const handleChaosModeChange = (e) => {
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
    const handleSelectDeck = (deck) => __awaiter(void 0, void 0, void 0, function* () {
        if (deck.isPublic) {
            if (addingToAdditionalDecks) {
                setAdditionalDecks((prevAdditionalDecks) => [...prevAdditionalDecks, Object.assign(Object.assign({}, deck), { id: (0, uuid_1.v4)() })]);
            }
            else {
                setSelectedDecks((prevSelectedDecks) => [...prevSelectedDecks, Object.assign(Object.assign({}, deck), { id: (0, uuid_1.v4)() })]);
                setTotalCards((prevTotal) => prevTotal + Number(deck.cardCount)); // Ensure cardCount is a number
            }
        }
        else {
            const password = prompt("Enter usage password:");
            if (password) {
                const response = yield axios_1.default.post("http://localhost:3000/validate-usage-password", {
                    deckName: deck.deckName,
                    usagePassword: password,
                });
                if (response.data.success) {
                    if (addingToAdditionalDecks) {
                        setAdditionalDecks((prevAdditionalDecks) => [...prevAdditionalDecks, Object.assign(Object.assign({}, deck), { id: (0, uuid_1.v4)() })]);
                    }
                    else {
                        setSelectedDecks((prevSelectedDecks) => [...prevSelectedDecks, Object.assign(Object.assign({}, deck), { id: (0, uuid_1.v4)() })]);
                        setTotalCards((prevTotal) => prevTotal + Number(deck.cardCount)); // Ensure cardCount is a number
                    }
                }
                else {
                    alert(response.data.message);
                }
            }
        }
    });
    const handleRemoveDeck = (deckId) => {
        const deckToRemove = selectedDecks.find(deck => deck.id === deckId);
        if (deckToRemove) {
            setTotalCards((prevTotal) => prevTotal - Number(deckToRemove.cardCount)); // Ensure cardCount is a number
        }
        setSelectedDecks((prevSelectedDecks) => prevSelectedDecks.filter(deck => deck.id !== deckId));
    };
    const handleRemoveAdditionalDeck = (deckId) => {
        setAdditionalDecks((prevAdditionalDecks) => prevAdditionalDecks.filter(deck => deck.id !== deckId));
    };
    const handleReturnFromDeckSearch = () => {
        setShowDeckSearch(false);
    };
    (0, react_1.useEffect)(() => {
        const fetchDecks = () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield axios_1.default.get("http://localhost:3000/search-decks", {
                params: { keyword: keyword.toLowerCase(), page },
            });
            const decksWithInfo = yield Promise.all(response.data.decks.map((deck) => __awaiter(void 0, void 0, void 0, function* () {
                const deckInfoResponse = yield axios_1.default.get("http://localhost:3000/deck-info", {
                    params: { deckName: deck.deckName },
                });
                return Object.assign(Object.assign({}, deck), { isPublic: deckInfoResponse.data.deckInfo.isPublic, starred: deckInfoResponse.data.deckInfo.starred, cardCount: deckInfoResponse.data.deckInfo.cardCount, description: deckInfoResponse.data.deckInfo.description // Ensure full description is included
                 });
            })));
            setDecks(decksWithInfo);
            setTotal(response.data.total);
        });
        fetchDecks();
    }, [keyword, page]);
    const handleMouseDown = (e) => {
        setDragging(true);
        setDragStart({ x: e.clientX - settingsPosition.left, y: e.clientY - settingsPosition.top });
    };
    const handleMouseMove = (e) => {
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
    (0, react_1.useEffect)(() => {
        if (dragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        else {
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
    (0, react_1.useEffect)(() => {
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
    const handleExpandDeck = (deck) => {
        setSelectedDeckInfo(deck);
    };
    const handleCloseDeckInfo = () => {
        setSelectedDeckInfo(null);
    };
    const handlePopupClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCloseDeckInfo();
        }
    };
    const styles = {
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
    return ((0, jsx_runtime_1.jsxs)("div", { style: styles.container, children: [(0, jsx_runtime_1.jsxs)("h1", { style: styles.title, children: ["Lobby: ", roomName] }), isHost && ((0, jsx_runtime_1.jsx)("button", { style: styles.startButton, onClick: handleStartGame, children: "Start Game" })), (0, jsx_runtime_1.jsx)("h3", { children: "Players in the Lobby:" }), (0, jsx_runtime_1.jsx)("ul", { style: styles.list, children: players.map((player, index) => ((0, jsx_runtime_1.jsx)("li", { style: styles.listItem, children: player.username }, index))) }), isHost && ((0, jsx_runtime_1.jsxs)("div", { style: styles.settingsContainer, onMouseDown: handleMouseDown, children: [(0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxLabel, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: infiniteMode, onChange: handleInfiniteModeChange, style: styles.checkbox }), "Infinite Mode", (0, jsx_runtime_1.jsx)("span", { style: styles.tooltip, children: "does not remove cards from decks when drawn" })] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxLabel, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: chaosMode, onChange: handleChaosModeChange, style: styles.checkbox }), "CHAOS MODE", (0, jsx_runtime_1.jsx)("span", { style: styles.tooltip, children: "use ALL public decks" })] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.numberInputLabel, children: ["Blank Cards:", (0, jsx_runtime_1.jsx)("input", { type: "number", value: blankCards, onChange: handleBlankCardsChange, style: styles.numberInput })] }), (0, jsx_runtime_1.jsx)("button", { style: styles.button, onClick: handleAddDecksClick, children: "Add Decks" }), (0, jsx_runtime_1.jsxs)("p", { style: { margin: 0 }, children: ["Total Cards: ", totalCards] }), " ", (0, jsx_runtime_1.jsx)("div", { style: styles.deckList, children: selectedDecks.map((deck) => ((0, jsx_runtime_1.jsxs)("div", { style: styles.deckItem, children: [(0, jsx_runtime_1.jsx)("button", { style: styles.removeButton, onClick: () => handleRemoveDeck(deck.id), children: "X" }), (0, jsx_runtime_1.jsx)("img", { src: `http://localhost:3000/decks/${deck.deckName}/important/${deck.thumbnail}`, alt: "thumbnail", style: styles.thumbnail }), (0, jsx_runtime_1.jsx)("span", { style: styles.deckNameText, children: deck.deckName })] }, deck.id))) }), (0, jsx_runtime_1.jsx)("button", { style: styles.additionalButton, onClick: handleAddAdditionalDecksClick, children: "Add Additional Decks" }), (0, jsx_runtime_1.jsx)("div", { style: styles.additionalDeckList, children: additionalDecks.map((deck) => ((0, jsx_runtime_1.jsxs)("div", { style: styles.deckItem, children: [(0, jsx_runtime_1.jsx)("button", { style: styles.removeButton, onClick: () => handleRemoveAdditionalDeck(deck.id), children: "X" }), (0, jsx_runtime_1.jsx)("img", { src: `http://localhost:3000/decks/${deck.deckName}/important/${deck.thumbnail}`, alt: "thumbnail", style: styles.thumbnail }), (0, jsx_runtime_1.jsx)("span", { style: styles.deckNameText, children: deck.deckName })] }, deck.id))) })] })), showDeckSearch && ((0, jsx_runtime_1.jsxs)("div", { style: styles.deckSearchContainer, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.searchContainer, children: [(0, jsx_runtime_1.jsx)("button", { style: styles.button, onClick: handleReturnFromDeckSearch, children: "Return" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search Decks", value: keyword, onChange: (e) => setKeyword(e.target.value), style: styles.deckSearchInput })] }), (0, jsx_runtime_1.jsx)("ul", { style: styles.deckSearchList, children: decks.map((deck, index) => ((0, jsx_runtime_1.jsxs)("li", { style: Object.assign(Object.assign({}, styles.deckSearchItem), { fontWeight: index % 2 === 0 ? 'bold' : 'normal' }), children: [(0, jsx_runtime_1.jsx)("button", { style: deck.isPublic ? styles.publicDeckButton : styles.privateDeckButton, onClick: () => handleSelectDeck(deck), children: "Select" }), deck.starred && (0, jsx_runtime_1.jsx)("span", { style: { marginRight: "5px" }, children: "\u2B50" }), (0, jsx_runtime_1.jsx)("img", { src: `http://localhost:3000/decks/${deck.deckName}/important/${deck.thumbnail}`, alt: "thumbnail", style: styles.deckThumbnail }), (0, jsx_runtime_1.jsx)("span", { style: styles.deckNameText, children: deck.deckName }), (0, jsx_runtime_1.jsx)("button", { style: styles.expandButton, onClick: () => handleExpandDeck(deck), children: "Expand" })] }, deck.deckName))) }), (0, jsx_runtime_1.jsx)("div", { style: styles.pagination, children: Array.from({ length: Math.ceil(total / 20) }, (_, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setPage(i + 1), style: styles.pageButton, children: i + 1 }, i))) })] })), selectedDeckInfo && ((0, jsx_runtime_1.jsx)("div", { style: styles.deckInfoOverlay, onClick: handlePopupClick, children: (0, jsx_runtime_1.jsxs)("div", { style: styles.deckInfoPopup, children: [(0, jsx_runtime_1.jsx)("h2", { children: selectedDeckInfo.deckName }), (0, jsx_runtime_1.jsx)("img", { src: `http://localhost:3000/decks/${selectedDeckInfo.deckName}/important/${selectedDeckInfo.thumbnail}`, alt: "thumbnail", style: styles.enlargedThumbnail }), (0, jsx_runtime_1.jsx)("p", { children: selectedDeckInfo.description })] }) })), (0, jsx_runtime_1.jsx)("button", { style: styles.disconnectButton, onClick: handleDisconnect, children: "Disconnect" })] }));
};
exports.default = LobbyScreen;
