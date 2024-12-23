"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_konva_1 = require("react-konva");
const socket_io_client_1 = require("socket.io-client");
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const fa_1 = require("react-icons/fa"); // Import the icon from react-icons
const axios_1 = __importDefault(require("axios")); // Import axios
const react_table_1 = require("react-table"); // Import useTable from react-table
const Game = () => {
    var _a, _b, _c, _d;
    const location = (0, react_router_dom_1.useLocation)();
    const { roomName, username, isHost } = location.state; // Add isHost to destructuring
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [rectangles, setRectangles] = (0, react_1.useState)([]); // Remove rectangles
    const [images, setImages] = (0, react_1.useState)([]); // State to store images
    const [chatVisible, setChatVisible] = (0, react_1.useState)(false); // State to control chat visibility
    const [messages, setMessages] = (0, react_1.useState)([]); // State to store chat messages
    const [newMessage, setNewMessage] = (0, react_1.useState)(""); // State to store the new message input
    const [deckMenuVisible, setDeckMenuVisible] = (0, react_1.useState)(false); // State to control deck menu visibility
    const deckButtonRef = (0, react_1.useRef)(null); // Ref to get Deck button position
    const [handVisible, setHandVisible] = (0, react_1.useState)(false); // State to control hand visibility
    const [handCards, setHandCards] = (0, react_1.useState)([]); // State to store hand cards
    const [selectedCard, setSelectedCard] = (0, react_1.useState)(null); // State to store the selected card
    const [selectedCardIndex, setSelectedCardIndex] = (0, react_1.useState)(null); // State to store the selected card index
    const [cardData, setCardData] = (0, react_1.useState)([]); // State to store card data
    const [logMoves, setLogMoves] = (0, react_1.useState)(false); // Add logMoves state and set it to false by default
    const [additionalDeckMenuVisible, setAdditionalDeckMenuVisible] = (0, react_1.useState)(false); // State to control additional deck menu visibility
    const [selectedAdditionalDeck, setSelectedAdditionalDeck] = (0, react_1.useState)(null); // State to store the selected additional deck
    const additionalDeckButtonRef = (0, react_1.useRef)(null); // Ref to get Additional Deck button position
    const [showSettingsPopup, setShowSettingsPopup] = (0, react_1.useState)(false); // State to control settings popup visibility
    const handContainerRef = (0, react_1.useRef)(null);
    const [isDraggingHand, setIsDraggingHand] = (0, react_1.useState)(false);
    const [dragStartX, setDragStartX] = (0, react_1.useState)(0);
    const [scrollStartX, setScrollStartX] = (0, react_1.useState)(0);
    const [peekCards, setPeekCards] = (0, react_1.useState)([]); // State to store peeked cards
    const [showPeekPopup, setShowPeekPopup] = (0, react_1.useState)(false); // State to control peek popup visibility
    const [cardOptions, setCardOptions] = (0, react_1.useState)([]); // State to store card options
    const [scores, setScores] = (0, react_1.useState)({});
    const [showScoresPopup, setShowScoresPopup] = (0, react_1.useState)(false);
    const [showCreateScorePopup, setShowCreateScorePopup] = (0, react_1.useState)(false);
    const [showDeleteScorePopup, setShowDeleteScorePopup] = (0, react_1.useState)(false);
    const [scoresVisible, setScoresVisible] = (0, react_1.useState)(false); // State to control scores visibility
    const [editMenuVisible, setEditMenuVisible] = (0, react_1.useState)(false); // State to control edit menu visibility
    const [showAddScorePopup, setShowAddScorePopup] = (0, react_1.useState)(false); // State to control add score popup visibility
    const [showRemoveScorePopup, setShowRemoveScorePopup] = (0, react_1.useState)(false); // State to control remove score popup visibility
    const [showPlayersPopup, setShowPlayersPopup] = (0, react_1.useState)(false);
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [selectedPlayer, setSelectedPlayer] = (0, react_1.useState)(null); // State to store the selected player
    const [showPlayerActionsPopup, setShowPlayerActionsPopup] = (0, react_1.useState)(false); // State to control player actions popup visibility
    const [viewingCards, setViewingCards] = (0, react_1.useState)([]); // State to store the cards being viewed
    const [viewingCardIndices, setViewingCardIndices] = (0, react_1.useState)([]); // State to store the indices of the cards being viewed
    const [revealLimit, setRevealLimit] = (0, react_1.useState)(null); // State to store the reveal limit
    const [stealCards, setStealCards] = (0, react_1.useState)([]); // State to store cards available for stealing
    const [showStealPopup, setShowStealPopup] = (0, react_1.useState)(false); // State to control steal popup visibility
    const [stealCardIndices, setStealCardIndices] = (0, react_1.useState)([]); // State to store indices of cards to steal
    const [playerCardCounts, setPlayerCardCounts] = (0, react_1.useState)({}); // State to store card counts
    const [showCardCountPopup, setShowCardCountPopup] = (0, react_1.useState)(false); // State to control card count popup visibility
    (0, react_1.useEffect)(() => {
        const fetchScores = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`http://localhost:3000/scores`, { params: { roomName } });
                if (response.data.success) {
                    setScores(response.data.scores);
                }
            }
            catch (error) {
                console.error("Error fetching scores:", error);
            }
        });
        fetchScores();
    }, [roomName]);
    const handleCreateScore = () => __awaiter(void 0, void 0, void 0, function* () {
        const scoreName = prompt("Enter the name of the new score:");
        const defaultValue = parseInt(prompt("Enter the default value for the new score:") || "", 10);
        if (scoreName && !isNaN(defaultValue)) {
            try {
                const response = yield axios_1.default.post("http://localhost:3000/create-score", { roomName, scoreName, defaultValue });
                if (response.data.success) {
                    setScores((prevScores) => (Object.assign(Object.assign({}, prevScores), { [scoreName]: prevScores.Points.map((player) => ({ name: player.name, value: defaultValue })) })));
                    if (socket) {
                        socket.emit("updateScores", { roomName, scores: Object.assign(Object.assign({}, scores), { [scoreName]: scores.Points.map((player) => ({ name: player.name, value: defaultValue })) }) });
                    }
                }
                else {
                    alert(response.data.message);
                }
            }
            catch (error) {
                console.error("Error creating score:", error);
            }
        }
    });
    const handleDeleteScore = (scoreName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("http://localhost:3000/delete-score", { roomName, scoreName });
            if (response.data.success) {
                setScores((prevScores) => {
                    const newScores = Object.assign({}, prevScores);
                    delete newScores[scoreName];
                    return newScores;
                });
            }
            else {
                alert(response.data.message);
            }
        }
        catch (error) {
            console.error("Error deleting score:", error);
        }
    });
    const handleHandMouseDown = (e) => {
        setIsDraggingHand(true);
        setDragStartX(e.clientX);
        if (handContainerRef.current) {
            setScrollStartX(handContainerRef.current.scrollLeft);
        }
    };
    const handleHandMouseMove = (e) => {
        if (isDraggingHand && handContainerRef.current) {
            const dx = e.clientX - dragStartX;
            handContainerRef.current.scrollLeft = scrollStartX - dx;
        }
    };
    const handleHandMouseUp = () => {
        setIsDraggingHand(false);
    };
    const handleHandWheel = (e) => {
        if (handContainerRef.current) {
            handContainerRef.current.scrollLeft += e.deltaY;
        }
    };
    (0, react_1.useEffect)(() => {
        if (isDraggingHand) {
            window.addEventListener("mousemove", handleHandMouseMove);
            window.addEventListener("mouseup", handleHandMouseUp);
        }
        else {
            window.removeEventListener("mousemove", handleHandMouseMove);
            window.removeEventListener("mouseup", handleHandMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleHandMouseMove);
            window.removeEventListener("mouseup", handleHandMouseUp);
        };
    }, [isDraggingHand]);
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                console.log(`Image loaded: ${src}`);
                resolve(img);
            };
            img.onerror = (err) => {
                console.error(`Error loading image: ${src}`, err);
                reject(err);
            };
        });
    };
    const loadCardData = (cardUrl) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(cardUrl.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
            return response.data;
        }
        catch (error) {
            console.error("Error loading card data:", error);
            return null;
        }
    });
    (0, react_1.useEffect)(() => {
        const newSocket = (0, socket_io_client_1.io)("http://localhost:3000");
        setSocket(newSocket);
        newSocket.on("connect", () => {
            console.log("Joining game room:", roomName);
            newSocket.emit("joinGame", { roomName, username });
        });
        newSocket.on("updateRectangles", (updatedRectangles) => {
            setRectangles(updatedRectangles);
        });
        newSocket.on("updateImages", (updatedImages) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const loadedImages = yield Promise.all(updatedImages.map((img) => __awaiter(void 0, void 0, void 0, function* () {
                    const image = yield loadImage(img.src);
                    const data = img.data || (yield loadCardData(img.src));
                    return Object.assign(Object.assign({}, img), { image, data });
                })));
                console.log("Loaded images:", loadedImages);
                setImages(loadedImages);
            }
            catch (error) {
                console.error("Error loading images:", error);
            }
        }));
        newSocket.on("chatMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        newSocket.on("updateHands", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Received updateHands event");
            try {
                const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/hands/${username}`);
                const handUrls = response.data.hand.map((card) => `http://localhost:3000${card}`);
                setHandCards(handUrls);
                console.log("Updated hand cards:", handUrls);
            }
            catch (error) {
                console.error("Error fetching hand cards:", error);
            }
        }));
        newSocket.on("updateScores", (updatedScores) => {
            console.log("Received updateScores event", updatedScores);
            setScores((prevScores) => (Object.assign(Object.assign({}, prevScores), updatedScores)));
            console.log("Scores updated on client:", updatedScores); // Log when the client receives the updated scores
        });
        newSocket.on("updatePlayers", (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });
        const fetchHandCards = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/hands/${username}.json`);
                setHandCards(response.data.hand);
                //setIsHost(response.data.isHost); // Retrieve isHost value
            }
            catch (error) {
                console.error("Error fetching hand cards:", error);
            }
        });
        const fetchPlayers = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/players`);
                if (response.data.success) {
                    setPlayers(response.data.players);
                }
            }
            catch (error) {
                console.error("Error fetching players:", error);
            }
        });
        fetchHandCards();
        fetchPlayers();
        return () => {
            newSocket.disconnect();
        };
    }, [roomName, username]);
    const debouncedUpdateRectangles = (0, react_1.useCallback)((0, lodash_debounce_1.default)((newRectangles) => {
        if (socket) {
            socket.emit("updateRectangles", { roomName, rectangles: newRectangles });
        }
    }, 300), [socket, roomName]);
    const debouncedUpdateImagePositions = (0, react_1.useCallback)((0, lodash_debounce_1.default)((newImages) => {
        if (socket) {
            socket.emit("updateImagePositions", { roomName, images: newImages });
        }
    }, 300), [socket, roomName]);
    const handleImageDragEnd = (e, index) => {
        const newImages = images.slice();
        newImages[index] = Object.assign(Object.assign({}, newImages[index]), { x: e.target.x(), y: e.target.y() });
        setImages(newImages);
        debouncedUpdateImagePositions(newImages);
        if (logMoves) {
            logAction({
                player: username,
                action: "moved an image",
                backgroundColor: "#ffcccc", // Very light red background
            });
        }
    };
    const handleSendMessage = () => {
        if (socket && newMessage.trim()) {
            socket.emit("chatMessage", { roomName, message: `${username}: ${newMessage}` });
            setNewMessage("");
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };
    const logAction = ({ player, action, victim, backgroundColor }) => {
        const message = victim ? `<b>${player}</b> ${action} <b>${victim}</b>` : `<b>${player}</b> ${action}`;
        const formattedMessage = `<span style="background-color: ${backgroundColor}; padding: 5px; border-radius: 5px;">${message}</span>`;
        if (socket) {
            socket.emit("chatMessage", { roomName, message: formattedMessage });
        }
    };
    const handleDeckButtonClick = () => {
        setDeckMenuVisible(!deckMenuVisible);
    };
    const handleDeckMenuOptionClick = (option) => {
        console.log(`Deck menu option selected: ${option}`);
        setDeckMenuVisible(false);
        if (socket) {
            if (option === "Draw") {
                axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count: 1 })
                    .then(response => {
                    if (response.data.success && response.data.cards.length > 0) {
                        socket.emit("drawCard", { roomName, username, deckName: "main" });
                    }
                    else {
                        logAction({ player: username, action: "tried to draw from an empty deck", backgroundColor: "#ffcccc" }); // Light red background
                    }
                })
                    .catch(error => {
                    console.error("Error checking deck:", error);
                });
            }
            else if (option === "Deal") {
                axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count: 1 })
                    .then(response => {
                    if (response.data.success && response.data.cards.length > 0) {
                        socket.emit("dealCard", { roomName, username, deckName: "main" });
                    }
                    else {
                        logAction({ player: username, action: "tried to deal from an empty deck", backgroundColor: "#ffcccc" }); // Light red background
                    }
                })
                    .catch(error => {
                    console.error("Error checking deck:", error);
                });
            }
            else if (option === "To Field") {
                axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count: 1 })
                    .then(response => {
                    if (response.data.success && response.data.cards.length > 0) {
                        socket.emit("drawCardToField", { roomName, username, deckName: "main" });
                    }
                    else {
                        logAction({ player: username, action: "tried to play from an empty deck", backgroundColor: "#ffcccc" }); // Light red background
                    }
                })
                    .catch(error => {
                    console.error("Error checking deck:", error);
                });
            }
            else if (option === "Peek") {
                const count = parseInt(prompt("Enter the number of cards to view:") || "", 10);
                if (count > 0) {
                    axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count })
                        .then(response => {
                        if (response.data.success) {
                            setPeekCards(response.data.cards.map((card) => `http://localhost:3000${card}`));
                            setShowPeekPopup(true);
                            logAction({ player: username, action: `viewed <b>${count}</b> cards from the deck`, backgroundColor: "#e6e6fa" }); // Light purple background
                        }
                        else {
                            alert(response.data.message);
                        }
                    })
                        .catch(error => {
                        console.error("Error peeking deck:", error);
                    });
                }
            }
        }
    };
    const handleAdditionalDeckButtonClick = () => __awaiter(void 0, void 0, void 0, function* () {
        if (additionalDeckMenuVisible) {
            setSelectedAdditionalDeck(null); // Close all sub-popups
        }
        setAdditionalDeckMenuVisible(!additionalDeckMenuVisible);
        if (!additionalDeckMenuVisible) {
            try {
                const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/decks`);
                const uniqueDecks = response.data.decks.filter((deck) => deck !== "main" && deck !== "discard");
                setAvailableDecks(uniqueDecks);
            }
            catch (error) {
                console.error("Error fetching additional decks:", error);
            }
        }
    });
    const handleAdditionalDeckMenuOptionClick = (deckName, option) => {
        console.log(`Additional deck menu option selected: ${option} for deck: ${deckName}`);
        setSelectedAdditionalDeck(deckName);
        setAdditionalDeckMenuVisible(false);
        if (socket) {
            if (option === "Draw") {
                axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName, count: 1 })
                    .then(response => {
                    if (response.data.success && response.data.cards.length > 0) {
                        socket.emit("drawCard", { roomName, username, deckName });
                    }
                    else {
                        logAction({ player: username, action: `tried to draw from an empty deck (${deckName})`, backgroundColor: "#ffcccc" }); // Light red background
                    }
                })
                    .catch(error => {
                    console.error("Error checking deck:", error);
                });
            }
            else if (option === "Deal") {
                axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName, count: 1 })
                    .then(response => {
                    if (response.data.success && response.data.cards.length > 0) {
                        socket.emit("dealCard", { roomName, username, deckName });
                    }
                    else {
                        logAction({ player: username, action: `tried to deal from an empty deck (${deckName})`, backgroundColor: "#ffcccc" }); // Light red background
                    }
                })
                    .catch(error => {
                    console.error("Error checking deck:", error);
                });
            }
            else if (option === "To Field") {
                axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName, count: 1 })
                    .then(response => {
                    if (response.data.success && response.data.cards.length > 0) {
                        socket.emit("drawCardToField", { roomName, username, deckName });
                    }
                    else {
                        logAction({ player: username, action: `tried to play from an empty deck (${deckName})`, backgroundColor: "#ffcccc" }); // Light red background
                    }
                })
                    .catch(error => {
                    console.error("Error checking deck:", error);
                });
            }
            else if (option === "Peek") {
                const count = parseInt(prompt("Enter the number of cards to view:") || "", 10);
                if (count > 0) {
                    axios_1.default.post("http://localhost:3000/peek-deck", { roomName, deckName, count })
                        .then(response => {
                        if (response.data.success) {
                            setPeekCards(response.data.cards.map((card) => `http://localhost:3000${card}`));
                            setShowPeekPopup(true);
                            logAction({ player: username, action: `viewed <b>${count}</b> cards from the <b>${deckName}</b> deck`, backgroundColor: "#e6e6fa" }); // Light purple background
                        }
                        else {
                            alert(response.data.message);
                        }
                    })
                        .catch(error => {
                        console.error("Error peeking deck:", error);
                    });
                }
            }
        }
    };
    (0, react_1.useEffect)(() => {
        if (socket) {
            socket.on("cardDrawnToField", (cardUrl) => __awaiter(void 0, void 0, void 0, function* () {
                const flippedCardUrl = "http://localhost:3000/assets/FLIPPED.png";
                const img = new Image();
                img.src = flippedCardUrl;
                img.onload = () => __awaiter(void 0, void 0, void 0, function* () {
                    const width = 100;
                    const height = width / 0.6; // Set aspect ratio to 0.6:1
                    const cardData = yield loadCardData(cardUrl);
                    const newCard = {
                        x: 50,
                        y: 50,
                        width,
                        height,
                        image: img, // Ensure the image is set correctly
                        src: flippedCardUrl,
                        data: Object.assign({ originalCard: cardUrl }, cardData),
                    };
                    setImages((prevImages) => [...prevImages, newCard]);
                    socket.emit("updateImagePositions", { roomName, images: [...images, newCard] }); // Ensure the server is updated with the new image
                });
            }));
        }
    }, [socket, images]);
    const handleHandButtonClick = () => __awaiter(void 0, void 0, void 0, function* () {
        setHandVisible(!handVisible);
        if (!handVisible) {
            try {
                const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/hands/${username}`);
                const handUrls = response.data.hand.map((card) => `http://localhost:3000${card}`);
                setHandCards(handUrls);
            }
            catch (error) {
                console.error("Error fetching hand cards:", error);
            }
        }
    });
    const handleHandCardClick = (card, index) => {
        setSelectedCard(card);
        setSelectedCardIndex(index);
        if (card.includes("BLANK.png")) {
            setCardOptions(["UPLOAD", "DISCARD"]);
        }
        else {
            setCardOptions(["PLAY", "PLAY FLIPPED", "DISCARD"]);
        }
    };
    const handlePlayCard = () => __awaiter(void 0, void 0, void 0, function* () {
        if (socket && selectedCard) {
            const cardUrl = selectedCard.startsWith("/assets/") ? `http://localhost:3000${selectedCard}` : selectedCard;
            const img = new Image();
            img.src = cardUrl;
            img.onload = () => __awaiter(void 0, void 0, void 0, function* () {
                const aspectRatio = img.width / img.height;
                const width = 100;
                const height = width / aspectRatio;
                const centerX = window.innerWidth / 2 - width / 2;
                const centerY = window.innerHeight / 2 - height / 2;
                let cardData;
                try {
                    const response = yield axios_1.default.get(cardUrl.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
                    cardData = response.data;
                }
                catch (error) {
                    console.error("Error loading card data:", error);
                    cardData = {
                        description: "",
                        values: [],
                        additional: []
                    };
                }
                socket.emit("playCard", { roomName, username, card: cardUrl, width, height, x: centerX, y: centerY, data: cardData });
            });
            setSelectedCard(null);
            setSelectedCardIndex(null);
            setHandVisible(false);
        }
    });
    const handlePlayFlippedCard = () => __awaiter(void 0, void 0, void 0, function* () {
        if (socket && selectedCard) {
            const flippedCardUrl = "http://localhost:3000/assets/FLIPPED.png";
            const img = new Image();
            img.src = flippedCardUrl;
            img.onload = () => __awaiter(void 0, void 0, void 0, function* () {
                const width = 100;
                const height = width / 0.6; // Set aspect ratio to 0.6:1
                const centerX = window.innerWidth / 2 - width / 2;
                const centerY = window.innerHeight / 2 - height / 2;
                let cardData;
                try {
                    const response = yield axios_1.default.get(selectedCard.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
                    cardData = response.data;
                }
                catch (error) {
                    console.error("Error loading card data:", error);
                    cardData = {
                        description: "",
                        values: [],
                        additional: []
                    };
                }
                cardData.originalCard = selectedCard;
                socket.emit("playCard", { roomName, username, card: flippedCardUrl, width, height, x: centerX, y: centerY, data: cardData });
                socket.emit("removeCardFromHand", { roomName, username, card: selectedCard }); // Remove the original card from the hand
                socket.emit("updateHands"); // Notify server to update hands
            });
            setSelectedCard(null);
            setSelectedCardIndex(null);
            setHandVisible(false);
        }
    });
    const handleDiscardCard = () => {
        if (socket && selectedCard) {
            socket.emit("discardCard", { roomName, username, card: selectedCard });
            setSelectedCard(null);
            setSelectedCardIndex(null);
            setHandVisible(false);
        }
    };
    const handleRevealCard = (index) => {
        if (revealLimit !== null && viewingCardIndices.length < revealLimit) {
            setViewingCardIndices((prevIndices) => [...prevIndices, index]);
        }
    };
    const handleUploadCard = () => __awaiter(void 0, void 0, void 0, function* () {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (event) => __awaiter(void 0, void 0, void 0, function* () {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("cardImage", file);
                formData.append("roomName", roomName);
                formData.append("username", username);
                try {
                    const response = yield axios_1.default.post("http://localhost:3000/upload-card-image", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    if (response.data.success) {
                        const newCardUrl = response.data.cardUrl;
                        const updatedHandCards = [...handCards];
                        const blankCardIndex = updatedHandCards.indexOf(selectedCard);
                        if (blankCardIndex > -1) {
                            updatedHandCards.splice(blankCardIndex, 1);
                        }
                        updatedHandCards.push(newCardUrl);
                        setHandCards(updatedHandCards);
                        setSelectedCard(null);
                        setSelectedCardIndex(null);
                        setHandVisible(false);
                    }
                    else {
                        alert("Failed to upload card image.");
                    }
                }
                catch (error) {
                    console.error("Error uploading card image:", error);
                    alert("Error uploading card image.");
                }
            }
        });
        fileInput.click();
    });
    const handleCancel = () => {
        setSelectedCard(null);
        setSelectedCardIndex(null);
    };
    const [selectedKonvaCard, setSelectedKonvaCard] = (0, react_1.useState)(null);
    const [showInspectPopup, setShowInspectPopup] = (0, react_1.useState)(false);
    const [showEditPopup, setShowEditPopup] = (0, react_1.useState)(false);
    const [showAdditionalPopup, setShowAdditionalPopup] = (0, react_1.useState)(false);
    const [editDescription, setEditDescription] = (0, react_1.useState)("");
    const [editValues, setEditValues] = (0, react_1.useState)([]);
    const [popupPosition, setPopupPosition] = (0, react_1.useState)(null);
    const handleKonvaCardClick = (card, e) => {
        e.cancelBubble = true; // Stop the event from propagating to the canvas
        if (card.src.includes("BLANK.png")) {
            console.warn("Blank cards cannot be clicked.");
            return;
        }
        setSelectedKonvaCard(card);
        setPopupPosition({ x: e.evt.clientX, y: e.evt.clientY });
    };
    const handleCanvasClick = () => {
        setSelectedKonvaCard(null);
        setPopupPosition(null);
        setShowInspectPopup(false); // Close the inspect popup if open
        setShowPeekPopup(false); // Close the peek popup if open
    };
    const handleInspect = () => {
        setShowInspectPopup(true);
    };
    const handleEdit = () => {
        setEditDescription(selectedKonvaCard.data.description);
        setEditValues(selectedKonvaCard.data.values);
        setShowEditPopup(true);
    };
    const handleFlip = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (socket && selectedKonvaCard) {
            const isFlipped = selectedKonvaCard.src.includes("FLIPPED.png");
            const cardUrl = isFlipped ? (_a = selectedKonvaCard.data) === null || _a === void 0 ? void 0 : _a.originalCard : ((_b = selectedKonvaCard.data) === null || _b === void 0 ? void 0 : _b.originalCard) || "http://localhost:3000/assets/FLIPPED.png";
            if (!cardUrl) {
                console.error("Original card URL not found.");
                return;
            }
            const img = new Image();
            img.src = cardUrl;
            img.onload = () => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                const aspectRatio = img.width / img.height;
                const width = 100;
                const height = isFlipped ? width / aspectRatio : width / 0.6; // Adjust aspect ratio based on flip state
                let newCardData = {};
                if (isFlipped) {
                    if (((_a = selectedKonvaCard.data) === null || _a === void 0 ? void 0 : _a.description) || ((_c = (_b = selectedKonvaCard.data) === null || _b === void 0 ? void 0 : _b.values) === null || _c === void 0 ? void 0 : _c.length) || ((_e = (_d = selectedKonvaCard.data) === null || _d === void 0 ? void 0 : _d.additional) === null || _e === void 0 ? void 0 : _e.length)) {
                        newCardData = {
                            description: selectedKonvaCard.data.description,
                            values: selectedKonvaCard.data.values,
                            additional: selectedKonvaCard.data.additional,
                        };
                    }
                    else {
                        try {
                            const response = yield axios_1.default.get(cardUrl.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
                            newCardData = response.data;
                        }
                        catch (error) {
                            console.error("Error loading card data:", error);
                            newCardData = { description: "", values: [], additional: [] };
                        }
                    }
                }
                else {
                    newCardData = Object.assign(Object.assign({}, selectedKonvaCard.data), { originalCard: selectedKonvaCard.src });
                }
                const newCard = {
                    x: selectedKonvaCard.x,
                    y: selectedKonvaCard.y,
                    width,
                    height,
                    image: img, // Ensure the image is set correctly
                    src: cardUrl,
                    data: newCardData,
                };
                const updatedImages = images.map((img) => (img === selectedKonvaCard ? newCard : img));
                setImages(updatedImages);
                socket.emit("updateImagePositions", { roomName, images: updatedImages });
                logAction({ player: username, action: "flipped a card", backgroundColor: "#d3d3d3" }); // Light grey background
                setSelectedKonvaCard(null);
                setPopupPosition(null); // Close the popup menu
            });
        }
    });
    const handleAdditional = () => {
        setShowAdditionalPopup(true);
    };
    const handlePlayAdditionalCard = (additionalCard) => {
        if (socket && selectedKonvaCard) {
            const mainCardUrl = selectedKonvaCard.src;
            const deckNameMatch = mainCardUrl.match(/\/decks\/([^/]+)\//);
            const deckName = deckNameMatch ? deckNameMatch[1] : null;
            let additionalCardUrl;
            if (additionalCard.startsWith("http://localhost:3000")) {
                additionalCardUrl = additionalCard;
            }
            else if (deckName) {
                additionalCardUrl = `http://localhost:3000/decks/${deckName}/additional/${additionalCard}`;
            }
            else {
                console.error("Deck name could not be determined from the main card URL.");
                return;
            }
            if (!additionalCardUrl) {
                console.error("Additional card URL is null or undefined.");
                return;
            }
            console.log("Playing additional card with URL:", additionalCardUrl); // Log the URL
            const img = new Image();
            img.src = additionalCardUrl;
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const width = 100;
                const height = width / aspectRatio;
                const data = {
                    description: "",
                    values: [],
                    additional: []
                };
                socket.emit("playCard", { roomName, username, card: additionalCardUrl, width, height, data });
                logAction({ player: username, action: "added an additional card", backgroundColor: "#ffffe0" }); // Very light yellow background
            };
            setShowAdditionalPopup(false);
        }
    };
    const handleDiscard = () => {
        if (socket && selectedKonvaCard) {
            socket.emit("discardCard", { roomName, username, card: selectedKonvaCard.src });
            socket.emit("updateImagePositions", {
                roomName,
                images: images.filter((img) => img !== selectedKonvaCard),
            });
            setSelectedKonvaCard(null);
        }
    };
    const handleSaveEdit = () => __awaiter(void 0, void 0, void 0, function* () {
        if (socket && selectedKonvaCard) {
            const updatedCard = Object.assign(Object.assign({}, selectedKonvaCard), { data: Object.assign(Object.assign({}, selectedKonvaCard.data), { description: editDescription, values: editValues }) });
            setImages(images.map((img) => (img === selectedKonvaCard ? updatedCard : img)));
            socket.emit("updateImagePositions", { roomName, images: images.map((img) => (img === selectedKonvaCard ? updatedCard : img)) });
            try {
                yield axios_1.default.post("http://localhost:3000/save-konva-card", {
                    roomName,
                    card: updatedCard,
                });
                console.log("Card data saved to server successfully.");
                logAction({ player: username, action: "edited a card", backgroundColor: "#ccffcc" }); // Lime green background
            }
            catch (error) {
                console.error("Error saving card data to server:", error);
            }
            setShowEditPopup(false);
        }
    });
    const handleEditInputChange = (e) => {
        const values = e.target.value.split(",").map((val) => {
            const num = parseFloat(val.trim());
            return isNaN(num) ? 0 : num;
        });
        setEditValues(values);
    };
    const [showDicePopup, setShowDicePopup] = (0, react_1.useState)(false);
    const [diceCount, setDiceCount] = (0, react_1.useState)(1);
    const [diceFaces, setDiceFaces] = (0, react_1.useState)(6);
    const handleDiceRoll = () => {
        const rolls = [];
        for (let i = 0; i < diceCount; i++) {
            rolls.push(Math.floor(Math.random() * diceFaces) + 1);
        }
        const sum = rolls.reduce((acc, roll) => acc + roll, 0);
        const rollResult = rolls.length > 1 ? `${rolls.join(" + ")} = ${sum}` : rolls[0];
        const message = `rolled <b>${diceCount}d${diceFaces}</b>: ${rollResult}`;
        logAction({ player: username, action: message, backgroundColor: "#dda0dd" }); // Purple background
        setShowDicePopup(false);
    };
    const [showDeckListPopup, setShowDeckListPopup] = (0, react_1.useState)(false);
    const [availableDecks, setAvailableDecks] = (0, react_1.useState)([]);
    const handleShuffleIn = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/decks`);
            const uniqueDecks = ["main", ...new Set(response.data.decks.filter((deck) => deck !== "main" && deck !== "discard"))];
            setAvailableDecks(uniqueDecks);
            setShowDeckListPopup(true);
        }
        catch (error) {
            console.error("Error fetching decks:", error);
        }
    });
    const handleShuffleInDeckSelect = (deckName) => __awaiter(void 0, void 0, void 0, function* () {
        if (socket && selectedKonvaCard) {
            const formattedCardUrl = selectedKonvaCard.src.startsWith("http://localhost:3000") ? selectedKonvaCard.src.replace("http://localhost:3000", "") : selectedKonvaCard.src;
            try {
                const response = yield axios_1.default.post("http://localhost:3000/shuffle-in-card", {
                    roomName,
                    cardUrl: formattedCardUrl,
                    deckName,
                });
                if (response.data.success) {
                    const updatedImages = images.filter(img => img !== selectedKonvaCard);
                    setImages(updatedImages);
                    socket.emit("updateImagePositions", { roomName, images: updatedImages });
                    logAction({ player: username, action: `shuffled a card into the <b>${deckName}</b> deck`, backgroundColor: "#ffcccc" }); // Very light red background
                }
                else {
                    alert("Failed to shuffle card into deck.");
                }
            }
            catch (error) {
                console.error("Error shuffling card into deck:", error);
            }
            finally {
                setShowDeckListPopup(false);
                setSelectedKonvaCard(null);
            }
        }
    });
    const handleScoreChange = (scoreName, playerName, newValue) => __awaiter(void 0, void 0, void 0, function* () {
        if (socket) {
            try {
                const oldValue = scores[scoreName].find((player) => player.name === playerName).value;
                yield axios_1.default.post("http://localhost:3000/update-score", { roomName, scoreName, playerName, newValue });
                logAction({
                    player: username,
                    action: `updated <b>${playerName}</b>'s <b>${scoreName}</b> from <b>${oldValue}</b> to <b>${newValue}</b>`,
                    backgroundColor: "#ffb6c1", // Pink background
                });
                setScores((prevScores) => (Object.assign(Object.assign({}, prevScores), { [scoreName]: prevScores[scoreName].map((player) => player.name === playerName ? Object.assign(Object.assign({}, player), { value: newValue }) : player) })));
                socket.emit("updateScores", { roomName, scores: Object.assign(Object.assign({}, scores), { [scoreName]: scores[scoreName].map((player) => player.name === playerName ? Object.assign(Object.assign({}, player), { value: newValue }) : player) }) });
            }
            catch (error) {
                console.error("Error updating score:", error);
            }
        }
    });
    const EditableCell = ({ value: initialValue, row: { original }, column: { id }, updateMyData }) => {
        const [value, setValue] = (0, react_1.useState)(initialValue);
        const onChange = (e) => {
            setValue(e.target.value);
        };
        const onBlur = () => {
            updateMyData(original.scoreName, id, value);
        };
        const onKeyPress = (e) => {
            if (e.key === "Enter") {
                updateMyData(original.scoreName, id, value);
            }
        };
        (0, react_1.useEffect)(() => {
            setValue(initialValue);
        }, [initialValue]);
        return (0, jsx_runtime_1.jsx)("input", { value: value, onChange: onChange, onBlur: onBlur, onKeyPress: onKeyPress, style: styles.scoreInput });
    };
    const defaultColumn = {
        Cell: (props) => (0, jsx_runtime_1.jsx)(EditableCell, Object.assign({}, props, { updateMyData: handleScoreChange })),
    };
    const columns = react_1.default.useMemo(() => [
        {
            Header: 'Score Type',
            accessor: 'scoreName',
            Cell: ({ value }) => (0, jsx_runtime_1.jsx)("span", { children: value }), // Make score type names uneditable
        },
        ...(scores.Points ? scores.Points.map((player) => ({
            Header: player.name.length > 10 ? `${player.name.substring(0, 10)}...` : player.name,
            accessor: player.name,
        })) : []),
    ], [scores.Points]);
    const data = react_1.default.useMemo(() => Object.keys(scores).map((scoreName) => (Object.assign({ scoreName }, (scores[scoreName] ? scores[scoreName].reduce((acc, player) => {
        acc[player.name] = player.value;
        return acc;
    }, {}) : {})))), [scores]);
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = (0, react_table_1.useTable)({
        columns,
        data,
        defaultColumn,
    });
    const handleScoresButtonClick = () => {
        setScoresVisible(!scoresVisible);
    };
    const handleEditButtonClick = () => {
        setEditMenuVisible(!editMenuVisible);
    };
    const handleAddScore = () => __awaiter(void 0, void 0, void 0, function* () {
        const scoreName = prompt("Enter the name of the new score:");
        const defaultValue = parseInt(prompt("Enter the default value for the new score:") || "", 10);
        if (scoreName && !isNaN(defaultValue)) {
            try {
                const response = yield axios_1.default.post("http://localhost:3000/create-score", { roomName, scoreName, defaultValue });
                if (response.data.success) {
                    setScores((prevScores) => (Object.assign(Object.assign({}, prevScores), { [scoreName]: prevScores.Points.map((player) => ({ name: player.name, value: defaultValue })) })));
                    logAction({ player: username, action: `created a new score: <b>${scoreName}</b>`, backgroundColor: "#ffb6c1" }); // Pink background
                }
                else {
                    alert(response.data.message);
                }
            }
            catch (error) {
                console.error("Error creating score:", error);
            }
        }
    });
    const handleRemoveScore = (scoreName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("http://localhost:3000/delete-score", { roomName, scoreName });
            if (response.data.success) {
                setScores((prevScores) => {
                    const newScores = Object.assign({}, prevScores);
                    delete newScores[scoreName];
                    return newScores;
                });
                logAction({ player: username, action: `removed the score: <b>${scoreName}</b>`, backgroundColor: "#ffb6c1" }); // Pink background
            }
            else {
                alert(response.data.message);
            }
        }
        catch (error) {
            console.error("Error deleting score:", error);
        }
    });
    const handlePlayersButtonClick = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Fetching players for room:", roomName);
        try {
            const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/players`);
            console.log("Server response:", response.data);
            if (response.data.success) {
                setPlayers(response.data.players);
                setShowPlayersPopup(true);
                console.log("Players fetched successfully:", response.data.players);
            }
            else {
                alert("Failed to fetch players.");
                console.error("Failed to fetch players:", response.data.message);
            }
        }
        catch (error) {
            console.error("Error fetching players:", error);
        }
    });
    const handlePlayerButtonClick = (player) => {
        setSelectedPlayer(player);
        setShowPlayerActionsPopup(true);
    };
    const handleViewCards = () => __awaiter(void 0, void 0, void 0, function* () {
        if (selectedPlayer) {
            const count = parseInt(prompt("Enter the number of cards to view:") || "", 10);
            if (count > 0) {
                setRevealLimit(count); // Save the reveal limit
                try {
                    const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/hands/${selectedPlayer}`);
                    const handUrls = response.data.hand.map((card) => `http://localhost:3000${card}`);
                    setViewingCards(handUrls);
                    setViewingCardIndices([]); // Initially, no cards are revealed
                    setHandVisible(false);
                    setShowPlayerActionsPopup(false);
                    logAction({ player: username, action: `is viewing up to <b>${count}</b> cards from <b>${selectedPlayer}</b>`, backgroundColor: "#e6e6fa" }); // Light purple background
                }
                catch (error) {
                    console.error("Error fetching player hand cards:", error);
                }
            }
        }
    });
    const handleStealCards = () => __awaiter(void 0, void 0, void 0, function* () {
        if (selectedPlayer) {
            try {
                const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/hands/${selectedPlayer}`);
                const handUrls = response.data.hand.map((card) => `http://localhost:3000${card}`);
                setStealCards(handUrls);
                setStealCardIndices([]); // Initially, no cards are revealed
                setHandVisible(false);
                setShowPlayerActionsPopup(false);
                setShowStealPopup(true);
                logAction({ player: username, action: `is attempting to steal a card from <b>${selectedPlayer}</b>`, backgroundColor: "#ffcccb" }); // Light red background
            }
            catch (error) {
                console.error("Error fetching player hand cards:", error);
            }
        }
    });
    const handleStealCard = (index) => {
        if (stealCardIndices.length === 0) {
            setStealCardIndices([index]);
        }
    };
    const confirmStealCard = () => {
        if (stealCardIndices.length > 0 && socket) { // Add null check for socket
            const cardIndex = stealCardIndices[0];
            socket.emit("stealCard", { roomName, thief: username, victim: selectedPlayer, cardIndex });
            setShowStealPopup(false);
            logAction({ player: username, action: `stole a card from <b>${selectedPlayer}</b>`, backgroundColor: "#ff9999" }); // Light red background
        }
    };
    const handleClosePlayerActionsPopup = () => {
        setShowPlayerActionsPopup(false);
    };
    const handleToHand = () => __awaiter(void 0, void 0, void 0, function* () {
        if (socket && selectedKonvaCard) {
            try {
                const formattedCardUrl = selectedKonvaCard.src.startsWith("http://localhost:3000") ? selectedKonvaCard.src.replace("http://localhost:3000", "") : selectedKonvaCard.src;
                const response = yield axios_1.default.post("http://localhost:3000/add-card-to-hand", {
                    roomName,
                    username,
                    cardUrl: formattedCardUrl,
                });
                if (response.data.success) {
                    const updatedImages = images.filter(img => img !== selectedKonvaCard);
                    setImages(updatedImages);
                    socket.emit("updateImagePositions", { roomName, images: updatedImages });
                    logAction({ player: username, action: "added a card to hand", backgroundColor: "#ccffcc" }); // Light green background
                }
                else {
                    alert("Failed to add card to hand.");
                }
            }
            catch (error) {
                console.error("Error adding card to hand:", error);
            }
            finally {
                setSelectedKonvaCard(null);
            }
        }
    });
    const handleSettingsButtonClick = () => {
        setShowSettingsPopup(!showSettingsPopup);
    };
    const handleCountCards = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/players`);
            if (response.data.success) {
                const players = response.data.players;
                const cardCounts = {};
                for (const player of players) {
                    const handResponse = yield axios_1.default.get(`http://localhost:3000/lobbies/${roomName}/hands/${player}`);
                    cardCounts[player] = handResponse.data.hand.length;
                }
                setPlayerCardCounts(cardCounts);
                setShowCardCountPopup(true); // Show the card count popup
            }
            else {
                alert("Failed to fetch players.");
            }
        }
        catch (error) {
            console.error("Error counting cards:", error);
        }
    });
    const handleCookieClick = () => {
        if (players.length > 0) {
            const randomPlayer = players[Math.floor(Math.random() * players.length)];
            logAction({
                player: "",
                action: `I CHOOSE: <b>${randomPlayer}</b>`,
                backgroundColor: "#dda0dd", // Purple background
            });
        }
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.scoresContainer, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.scoresButtonContainer, children: [(0, jsx_runtime_1.jsx)("button", { style: styles.scoresButton, onClick: handleScoresButtonClick, children: scoresVisible ? "Hide Scores" : "Show Scores" }), (0, jsx_runtime_1.jsx)("button", { style: styles.scoresButton, onClick: handleEditButtonClick, children: "EDIT" })] }), editMenuVisible && ((0, jsx_runtime_1.jsxs)("div", { style: styles.editMenu, children: [(0, jsx_runtime_1.jsx)("button", { style: styles.editMenuItem, onClick: () => setShowAddScorePopup(true), children: "Add Score" }), (0, jsx_runtime_1.jsx)("button", { style: styles.editMenuItem, onClick: () => setShowRemoveScorePopup(true), children: "Remove Score" })] })), scoresVisible && ((0, jsx_runtime_1.jsxs)("table", Object.assign({}, getTableProps(), { style: styles.scoresTable, children: [(0, jsx_runtime_1.jsx)("thead", { children: headerGroups.map((headerGroup) => ((0, jsx_runtime_1.jsx)("tr", Object.assign({}, headerGroup.getHeaderGroupProps(), { children: headerGroup.headers.map((column) => ((0, jsx_runtime_1.jsx)("th", Object.assign({}, column.getHeaderProps(), { style: styles.tableHeader, children: column.render('Header') })))) })))) }), (0, jsx_runtime_1.jsx)("tbody", Object.assign({}, getTableBodyProps(), { children: rows.map((row) => {
                                    prepareRow(row);
                                    return ((0, jsx_runtime_1.jsx)("tr", Object.assign({}, row.getRowProps(), { children: row.cells.map((cell) => ((0, jsx_runtime_1.jsx)("td", Object.assign({}, cell.getCellProps(), { style: styles.tableCell, children: cell.render('Cell') })))) })));
                                }) }))] })))] }), showAddScorePopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.popup, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Add Score" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleAddScore, children: "Add Score" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowAddScorePopup(false), children: "Cancel" })] })), showRemoveScorePopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.popup, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Remove Score" }), Object.keys(scores).map((scoreName, index) => ((0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => handleRemoveScore(scoreName), children: scoreName }, index))), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowRemoveScorePopup(false), children: "Cancel" })] })), (0, jsx_runtime_1.jsx)(react_konva_1.Stage, { width: window.innerWidth, height: window.innerHeight, onClick: handleCanvasClick, children: (0, jsx_runtime_1.jsx)(react_konva_1.Layer, { children: images.map((img, index) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_konva_1.Image, { x: img.x, y: img.y, width: img.width, height: img.height, image: img.image, draggable: true, onDragEnd: (e) => handleImageDragEnd(e, index), onClick: (e) => handleKonvaCardClick(img, e) }), !img.src.includes("FLIPPED.png") && img.data && img.data.values && img.data.values.length > 0 && (img.data.values.map((value, valueIndex) => {
                                const valuesPerRow = 3; // Ensure rows of 3 values
                                const rowIndex = Math.floor(valueIndex / valuesPerRow);
                                const colIndex = valueIndex % valuesPerRow;
                                const totalValues = img.data.values.length;
                                const valuesInCurrentRow = Math.min(valuesPerRow, totalValues - rowIndex * valuesPerRow);
                                let xPosition;
                                if (valuesInCurrentRow === 1) {
                                    xPosition = img.x + img.width / 2 + 50;
                                }
                                else if (valuesInCurrentRow === 2) {
                                    xPosition = img.x + (colIndex === 0 ? img.width / 4 + 25 : (3 * img.width) / 4 + 60);
                                }
                                else if (valuesInCurrentRow === 3) {
                                    xPosition = img.x + (colIndex === 0 ? img.width / 4 + 25 : colIndex === 1 ? img.width / 2 + 40 : (3 * img.width) / 4 + 60);
                                }
                                else {
                                    xPosition = img.x + ((colIndex + 1) * img.width) / (valuesInCurrentRow + 1) + 50;
                                }
                                return ((0, jsx_runtime_1.jsx)(react_konva_1.Text, { x: xPosition - img.width / 2, y: img.y - 20 - rowIndex * 20, text: value.toString(), fontSize: 14, fontStyle: "bold" // Make the values bold
                                    , fill: "black" }, valueIndex));
                            }))] }, index))) }) }), isHost && ((0, jsx_runtime_1.jsx)("button", { style: Object.assign(Object.assign({}, styles.settingsButton), { zIndex: 2000 }), onClick: handleSettingsButtonClick, children: "\u2699\uFE0F" })), showSettingsPopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.settingsPopup, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Game Settings" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowSettingsPopup(false), children: "Close" })] })), (0, jsx_runtime_1.jsx)("button", { style: Object.assign(Object.assign({}, styles.diceToggleButton), { zIndex: 2000 }), onClick: () => setShowDicePopup(!showDicePopup), children: "\uD83C\uDFB2" }), (0, jsx_runtime_1.jsx)("button", { style: Object.assign(Object.assign({}, styles.chatToggleButton), { zIndex: 2000 }), onClick: () => setChatVisible(!chatVisible), children: (0, jsx_runtime_1.jsx)(fa_1.FaComments, {}) }), chatVisible && ((0, jsx_runtime_1.jsx)("img", { src: "http://localhost:3000/assets/COOKIE.png", alt: "Cookie", style: styles.cookieImage, onClick: handleCookieClick, onMouseEnter: (e) => (e.currentTarget.style.transform = styles.cookieImageHover.transform || 'scale(1.2)'), onMouseLeave: (e) => (e.currentTarget.style.transform = "scale(1)") })), showDicePopup && ((0, jsx_runtime_1.jsxs)("div", { style: Object.assign(Object.assign({}, styles.dicePopup), { right: chatVisible ? '370px' : '10px' }), children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.diceInputContainer, children: [(0, jsx_runtime_1.jsx)("input", { type: "number", value: diceCount, onChange: (e) => setDiceCount(parseInt(e.target.value, 10)), style: styles.diceInput }), (0, jsx_runtime_1.jsx)("span", { style: styles.diceSeparator, children: "d" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: diceFaces, onChange: (e) => setDiceFaces(parseInt(e.target.value, 10)), style: styles.diceInput })] }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleDiceRoll, children: "ROLL" })] })), selectedKonvaCard && popupPosition && ((0, jsx_runtime_1.jsx)("div", { style: Object.assign(Object.assign({}, styles.popupMenu), { top: popupPosition.y, left: popupPosition.x }), children: ((_a = selectedKonvaCard.data) === null || _a === void 0 ? void 0 : _a.originalCard) ? ((0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleFlip, children: "FLIP" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleInspect, children: "INSPECT" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleEdit, children: "EDIT" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleFlip, children: "FLIP" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleAdditional, children: "ADDITIONAL" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleShuffleIn, children: "SHUFFLE IN" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleToHand, children: "TO HAND" }), " ", (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleDiscard, children: "DISCARD" })] })) })), showDeckListPopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.deckListPopup, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Select a Deck" }), (0, jsx_runtime_1.jsx)("div", { style: styles.deckListContainer, children: availableDecks.map((deck, index) => ((0, jsx_runtime_1.jsx)("button", { style: styles.deckListButton, onClick: () => handleShuffleInDeckSelect(deck), children: deck }, index))) }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowDeckListPopup(false), children: "Cancel" })] })), showInspectPopup && selectedKonvaCard && ((0, jsx_runtime_1.jsxs)("div", { style: styles.inspectPopup, children: [(0, jsx_runtime_1.jsx)("img", { src: selectedKonvaCard.src, alt: "Card", style: styles.inspectImage }), (0, jsx_runtime_1.jsx)("p", { children: (_b = selectedKonvaCard.data) === null || _b === void 0 ? void 0 : _b.description }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowInspectPopup(false), children: "Close" })] })), showEditPopup && selectedKonvaCard && ((0, jsx_runtime_1.jsxs)("div", { style: styles.editPopup, children: [(0, jsx_runtime_1.jsx)("textarea", { value: editDescription, onChange: (e) => setEditDescription(e.target.value), style: styles.editTextarea }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: editValues.join(", "), onChange: handleEditInputChange, style: styles.editInput }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleSaveEdit, children: "Save" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowEditPopup(false), children: "Cancel" })] })), showAdditionalPopup && selectedKonvaCard && ((0, jsx_runtime_1.jsxs)("div", { style: styles.additionalPopup, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.additionalCardContainer, children: [(0, jsx_runtime_1.jsx)("img", { src: selectedKonvaCard.src, alt: "Duplicate Card", style: styles.additionalCard, onClick: () => handlePlayAdditionalCard(selectedKonvaCard.src) }), (_d = (_c = selectedKonvaCard.data) === null || _c === void 0 ? void 0 : _c.additional) === null || _d === void 0 ? void 0 : _d.map((additionalCard, index) => {
                                const mainCardUrl = selectedKonvaCard.src;
                                const deckNameMatch = mainCardUrl.match(/\/decks\/([^/]+)\//);
                                const deckName = deckNameMatch ? deckNameMatch[1] : null;
                                const additionalCardUrl = deckName ? `http://localhost:3000/decks/${deckName}/additional/${additionalCard}` : null;
                                if (!additionalCardUrl) {
                                    console.error("Additional card URL could not be determined.");
                                    return null;
                                }
                                return ((0, jsx_runtime_1.jsx)("img", { src: additionalCardUrl, alt: `Additional Card ${index}`, style: styles.additionalCard, onClick: () => handlePlayAdditionalCard(additionalCard) }, index));
                            })] }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowAdditionalPopup(false), children: "Close" })] })), showPeekPopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.peekPopup, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.peekContent, children: peekCards.map((card, index) => ((0, jsx_runtime_1.jsx)("img", { src: card, alt: `Peeked Card ${index}`, style: styles.peekCard }, index))) }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowPeekPopup(false), children: "Close" })] })), (0, jsx_runtime_1.jsxs)("div", { style: styles.buttonContainer, children: [(0, jsx_runtime_1.jsx)("button", { ref: deckButtonRef, style: styles.button, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || ''), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || ''), onClick: handleDeckButtonClick, children: "Deck" }), (0, jsx_runtime_1.jsx)("button", { style: styles.handButton, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || ''), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || ''), onClick: handleHandButtonClick, children: "HAND" }), (0, jsx_runtime_1.jsx)("button", { style: styles.button, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || ''), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || ''), onClick: handlePlayersButtonClick, children: "PLAYERS" }), (0, jsx_runtime_1.jsx)("button", { ref: additionalDeckButtonRef, style: styles.button, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || ''), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || ''), onClick: handleAdditionalDeckButtonClick, children: "Additional Decks" })] }), deckMenuVisible && deckButtonRef.current && ((0, jsx_runtime_1.jsxs)("div", { style: Object.assign(Object.assign({}, styles.deckMenu), { left: `${deckButtonRef.current.getBoundingClientRect().left}px`, width: `${deckButtonRef.current.getBoundingClientRect().width - 5}px` }), children: [(0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleDeckMenuOptionClick("Peek"), children: "Peek" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleDeckMenuOptionClick("To Field"), children: "To Field" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleDeckMenuOptionClick("Deal"), children: "Deal" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleDeckMenuOptionClick("Draw"), children: "Draw" })] })), additionalDeckMenuVisible && additionalDeckButtonRef.current && ((0, jsx_runtime_1.jsxs)("div", { style: Object.assign(Object.assign({}, styles.deckMenu), { left: `${additionalDeckButtonRef.current.getBoundingClientRect().left}px`, width: `${additionalDeckButtonRef.current.getBoundingClientRect().width - 5}px` }), children: [availableDecks.map((deck, index) => ((0, jsx_runtime_1.jsxs)("div", { style: styles.additionalDeckMenuItem, children: [(0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => setSelectedAdditionalDeck(deck), children: deck }), selectedAdditionalDeck === deck && ((0, jsx_runtime_1.jsxs)("div", { style: Object.assign({}, styles.subDeckMenu), children: [(0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick(deck, "Peek"), children: "Peek" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick(deck, "To Field"), children: "To Field" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick(deck, "Deal"), children: "Deal" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick(deck, "Draw"), children: "Draw" })] }))] }, index))), (0, jsx_runtime_1.jsxs)("div", { style: styles.additionalDeckMenuItem, children: [(0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => setSelectedAdditionalDeck("discard"), children: "Discard" }), selectedAdditionalDeck === "discard" && ((0, jsx_runtime_1.jsxs)("div", { style: Object.assign({}, styles.subDeckMenu), children: [(0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick("discard", "Peek"), children: "Peek" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick("discard", "To Field"), children: "To Field" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick("discard", "Deal"), children: "Deal" }), (0, jsx_runtime_1.jsx)("button", { style: styles.deckMenuItem, onClick: () => handleAdditionalDeckMenuOptionClick("discard", "Draw"), children: "Draw" })] }))] })] })), chatVisible && ((0, jsx_runtime_1.jsxs)("div", { style: styles.chatContainer, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.chatMessages, children: messages.map((msg, index) => ((0, jsx_runtime_1.jsx)("div", { style: styles.chatMessage, dangerouslySetInnerHTML: { __html: msg } }, index))) }), (0, jsx_runtime_1.jsxs)("div", { style: styles.chatInputContainer, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newMessage, onChange: (e) => setNewMessage(e.target.value), onKeyPress: handleKeyPress, style: styles.chatInput, placeholder: "Type a message..." }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSendMessage, style: styles.sendButton, children: "Send" })] })] })), handVisible && ((0, jsx_runtime_1.jsx)("div", { ref: handContainerRef, style: styles.handContainer, onMouseDown: handleHandMouseDown, onWheel: handleHandWheel, onClick: handleCancel, children: (0, jsx_runtime_1.jsx)("div", { style: styles.handContent, children: handCards.map((card, index) => ((0, jsx_runtime_1.jsxs)("div", { style: styles.cardContainer, onClick: (e) => { e.stopPropagation(); handleHandCardClick(card, index); }, children: [(0, jsx_runtime_1.jsx)("img", { src: card, alt: `Card ${index}`, style: styles.handCard }), selectedCard === card && selectedCardIndex === index && ((0, jsx_runtime_1.jsxs)("div", { style: styles.cardOptions, children: [cardOptions.includes("PLAY") && (0, jsx_runtime_1.jsx)("button", { style: styles.cardOptionButton, onClick: handlePlayCard, children: "PLAY" }), cardOptions.includes("PLAY FLIPPED") && (0, jsx_runtime_1.jsx)("button", { style: styles.cardOptionButton, onClick: handlePlayFlippedCard, children: "PLAY FLIPPED" }), cardOptions.includes("DISCARD") && (0, jsx_runtime_1.jsx)("button", { style: styles.cardOptionButton, onClick: handleDiscardCard, children: "DISCARD" }), cardOptions.includes("UPLOAD") && (0, jsx_runtime_1.jsx)("button", { style: styles.cardOptionButton, onClick: handleUploadCard, children: "UPLOAD" })] }))] }, index))) }) })), showPlayersPopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.popup, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Players in Lobby" }), (0, jsx_runtime_1.jsx)("ul", { children: players.map((player, index) => ((0, jsx_runtime_1.jsxs)("li", { style: styles.playerListItem, children: [(0, jsx_runtime_1.jsx)("span", { children: player.length > 15 ? `${player.substring(0, 15)}...` : player }), (0, jsx_runtime_1.jsx)("div", { style: styles.playerActionsContainer, children: (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => handlePlayerButtonClick(player), children: "Actions" }) })] }, index))) }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleCountCards, children: "Count Cards" }), " ", (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowPlayersPopup(false), children: "Close" })] })), showPlayerActionsPopup && selectedPlayer && ((0, jsx_runtime_1.jsxs)("div", { style: styles.popup, children: [(0, jsx_runtime_1.jsxs)("h3", { children: ["Actions for ", selectedPlayer] }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleViewCards, children: "View Cards" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleStealCards, children: "Steal Cards" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: handleClosePlayerActionsPopup, children: "Close" })] })), viewingCards.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: styles.viewingContainer, children: [viewingCards.map((card, index) => ((0, jsx_runtime_1.jsx)("div", { style: styles.viewingCard, onClick: () => handleRevealCard(index), children: viewingCardIndices.includes(index) ? ((0, jsx_runtime_1.jsx)("img", { src: card, alt: `Card ${index}`, style: styles.viewingCardImage })) : ((0, jsx_runtime_1.jsx)("div", { style: styles.viewingCardPlaceholder })) }, index))), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setViewingCards([]), children: "Close" })] })), showStealPopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.stealPopup, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Select a Card to Steal" }), (0, jsx_runtime_1.jsx)("div", { style: styles.stealContent, children: stealCards.map((card, index) => ((0, jsx_runtime_1.jsx)("div", { style: styles.stealCard, onClick: () => handleStealCard(index), children: stealCardIndices.includes(index) ? ((0, jsx_runtime_1.jsx)("div", { style: styles.stealCardSelected, children: "Selected" })) : ((0, jsx_runtime_1.jsx)("div", { style: styles.stealCardPlaceholder })) }, index))) }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: confirmStealCard, children: "Confirm Steal" }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowStealPopup(false), children: "Cancel" })] })), showCardCountPopup && ((0, jsx_runtime_1.jsxs)("div", { style: styles.cardCountPopup, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Card Counts" }), (0, jsx_runtime_1.jsxs)("table", { style: styles.cardCountTable, children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { style: styles.tableHeader, children: "Player" }), (0, jsx_runtime_1.jsx)("th", { style: styles.tableHeader, children: "Card Count" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: Object.entries(playerCardCounts).map(([player, count], index) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { style: styles.tableCell, children: player }), (0, jsx_runtime_1.jsx)("td", { style: styles.tableCell, children: count })] }, index))) })] }), (0, jsx_runtime_1.jsx)("button", { style: styles.popupButton, onClick: () => setShowCardCountPopup(false), children: "Close" })] }))] }));
};
const styles = {
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px',
        backgroundColor: '#f0f0f0',
    },
    button: {
        padding: '10px 40px',
        fontSize: '1rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        fontWeight: 'bold',
    },
    handButton: {
        padding: '10px 60px',
        fontSize: '1.5rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        fontWeight: 'bold',
    },
    buttonHover: {
        backgroundColor: '#ccc',
    },
    chatToggleButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '8px', // Reduce the height of the chat button
        fontSize: '1.5rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        zIndex: 2000,
    },
    diceToggleButton: {
        position: 'absolute',
        top: '10px',
        right: '60px', // Adjusted to place it to the left of the chat button
        padding: '8px',
        fontSize: '1.5rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        zIndex: 2000,
    },
    chatContainer: {
        position: 'absolute',
        top: '50px',
        right: '10px',
        width: '350px', // Increase the width of the chat popup
        height: '600px', // Increase the height of the chat popup
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 3000, // Increase z-index
    },
    chatMessages: {
        flex: 1,
        padding: '10px',
        overflowY: 'auto',
    },
    chatMessage: {
        marginBottom: '10px',
        fontFamily: 'Consolas, monospace',
    },
    chatInputContainer: {
        display: 'flex',
        padding: '10px',
        borderTop: '2px solid #000',
    },
    chatInput: {
        flex: 1,
        padding: '10px',
        fontSize: '1rem',
        border: '2px solid #000',
        borderRadius: '5px',
        fontFamily: 'Consolas, monospace',
    },
    sendButton: {
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        marginLeft: '10px',
    },
    deckMenu: {
        position: 'absolute',
        bottom: '60px',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
    },
    deckMenuItem: {
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#fff',
        color: '#000',
        border: 'none',
        borderBottom: '1px solid #000',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        fontWeight: 'bold',
    },
    handContainer: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '80%',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '5px',
        overflowX: 'scroll', // Ensure horizontal scrolling
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    handContent: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: 'max-content', // Ensure the content width adjusts to fit all cards
        minWidth: '100%', // Ensure the content width is at least 100% of the container
    },
    handCard: {
        width: '500px', // Increase width
        height: 'auto', // Maintain aspect ratio
        margin: '10px',
    },
    cardContainer: {
        position: 'relative',
    },
    cardOptions: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '5px',
        zIndex: 1000,
        padding: '10px', // Increase padding
    },
    cardOptionButton: {
        padding: '10px 20px', // Increase padding
        fontSize: '1rem', // Increase font size
        backgroundColor: '#fff',
        color: '#000',
        border: '1px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        margin: '5px 0', // Increase margin
    },
    popupMenu: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
    },
    popupButton: {
        padding: '10px 20px',
        margin: '5px 0',
        fontSize: '1rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
    },
    inspectPopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '40px', // Increase padding
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 'auto', // Adjust width to fit the image
        maxHeight: '70%', // Decrease the maximum height to ensure the close button is in frame
    },
    inspectImage: {
        width: 'auto',
        height: 'auto',
        maxWidth: 'calc(4/7 * 100vw)', // Ensure the image width does not exceed 4/7 of the viewport width
        maxHeight: 'calc(4/7 * 100vh)', // Ensure the image height does not exceed 4/7 of the viewport height
        marginBottom: '20px', // Increase margin
    },
    editPopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    editTextarea: {
        width: '300px',
        height: '100px',
        marginBottom: '10px',
        padding: '10px',
        fontSize: '1rem',
        border: '2px solid #000',
        borderRadius: '5px',
        fontFamily: 'Consolas, monospace',
    },
    editInput: {
        width: '300px',
        marginBottom: '10px',
        padding: '10px',
        fontSize: '1rem',
        border: '2px solid #000',
        borderRadius: '5px',
        fontFamily: 'Consolas, monospace',
    },
    additionalPopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '50%', // Reduce the height
        overflowY: 'auto', // Allow vertical scrolling
    },
    additionalCardContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '80%', // Reduce the height of the container
        overflowY: 'auto', // Allow vertical scrolling
    },
    additionalCard: {
        width: '100px',
        height: 'auto',
        margin: '10px',
        cursor: 'pointer',
    },
    dicePopup: {
        position: 'absolute',
        top: '100px',
        right: '10px',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 3000, // Increase z-index
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    diceInputContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    },
    diceInput: {
        width: '50px',
        padding: '5px',
        fontSize: '1rem',
        border: '2px solid #000',
        borderRadius: '5px',
        margin: '5px',
        textAlign: 'center',
    },
    diceSeparator: {
        fontSize: '1.5rem',
        margin: '0 10px',
    },
    deckListPopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '50%',
        overflowY: 'auto',
    },
    deckListContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '80%',
        overflowY: 'auto',
    },
    deckListButton: {
        padding: '10px 20px',
        margin: '5px 0',
        fontSize: '1rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
    },
    peekPopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '50%',
        overflowY: 'auto',
    },
    peekContent: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        maxHeight: '80%',
        overflowY: 'auto',
    },
    peekCard: {
        width: '200px', // Increase width
        height: 'auto',
        margin: '10px',
    },
    additionalDeckMenuItem: {
        position: 'relative',
    },
    subDeckMenu: {
        position: 'fixed', // Change to fixed to ensure it's always centered
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // Center horizontally and vertically
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        width: 'auto', // Ensure the width adjusts to fit the content
        maxWidth: '90%', // Ensure the popup does not exceed 90% of the viewport width
        maxHeight: '90%', // Ensure the popup does not exceed 90% of the viewport height
        overflowY: 'auto', // Allow vertical scrolling if content exceeds max height
    },
    scoresContainer: {
        position: 'absolute',
        top: 0,
        width: '100%',
        backgroundColor: '#f0f0f0',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1000,
    },
    scoresButton: {
        marginBottom: '10px',
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
    },
    scoresTable: {
        width: 'auto',
        borderCollapse: 'collapse',
        textAlign: 'center',
    },
    tableHeader: {
        borderBottom: '2px solid #000',
        padding: '5px',
        textAlign: 'center',
    },
    tableCell: {
        borderBottom: '1px solid #000',
        padding: '5px',
        textAlign: 'center',
        borderRight: '1px solid #ccc', // Faint vertical dividing lines
    },
    scoreInput: {
        width: '50px',
        textAlign: 'center',
        border: '1px solid #000',
        borderRadius: '5px',
        padding: '5px',
    },
    scoreCheckboxLabel: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    },
    createScorePopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    deleteScorePopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    scoresButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editMenu: {
        position: 'absolute',
        top: '50px',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
    },
    editMenuItem: {
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#fff',
        color: '#000',
        border: 'none',
        borderBottom: '1px solid #000',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        fontWeight: 'bold',
    },
    popup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    playerListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    playerActionsContainer: {
        marginLeft: '10px', // Add gap between player name and action button
    },
    viewingContainer: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '80%',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '5px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    viewingCard: {
        width: '150px',
        height: '200px',
        margin: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        border: '1px solid #000',
        borderRadius: '5px',
        backgroundColor: '#fff',
    },
    viewingCardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    viewingCardPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ccc',
    },
    stealPopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '50%',
        overflowY: 'auto',
    },
    stealContent: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        maxHeight: '80%',
        overflowY: 'auto',
    },
    stealCard: {
        width: '150px',
        height: '200px',
        margin: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        border: '1px solid #000',
        borderRadius: '5px',
        backgroundColor: '#fff',
    },
    stealCardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    stealCardPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ccc',
    },
    stealCardSelected: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ccc',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '1.2rem',
    },
    settingsButton: {
        position: 'absolute',
        top: '10px',
        right: '110px', // Adjusted to place it to the left of the dice button
        padding: '8px',
        fontSize: '1.5rem',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontFamily: 'Consolas, monospace',
        zIndex: 2000,
    },
    settingsPopup: {
        position: 'absolute',
        top: '100px',
        right: '10px',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 3000, // Increase z-index
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    cardCountPopup: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '10px',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    cardCountTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
    },
    cookieImage: {
        position: 'absolute',
        top: '660px', // Adjust the position as needed
        right: '10px',
        width: '100px',
        height: '100px',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        zIndex: 2000,
    },
    cookieImageHover: {
        transform: 'scale(1.2)',
    },
};
exports.default = Game;
