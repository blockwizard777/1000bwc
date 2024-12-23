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
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios")); // Add this line to import axios
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json()); // Add this line to parse JSON bodies
// Serve static files from the 'decks' and 'assets' directories
app.use('/decks', express_1.default.static(path_1.default.join(__dirname, 'decks')));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, 'assets')));
// Serve static files from the 'lobbies' directory
app.use('/lobbies', express_1.default.static(path_1.default.join(__dirname, 'lobbies')));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path_1.default.join(__dirname, "uploads");
        fs_1.default.mkdirSync(tempDir, { recursive: true });
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
app.post("/create-deck", upload.single("thumbnail"), (req, res) => {
    const { deckName, description, editPassword, isPublic, usagePassword } = req.body;
    const thumbnail = req.file;
    const deckPath = path_1.default.join(__dirname, "decks", deckName, "important");
    const additionalPath = path_1.default.join(__dirname, "decks", deckName, "additional");
    const cardsPath = path_1.default.join(__dirname, "decks", deckName, "cards");
    if (fs_1.default.existsSync(deckPath)) {
        res.json({ success: false, message: "Deck name already in use." });
        return;
    }
    if (thumbnail && !allowedImageTypes.includes(thumbnail.mimetype)) {
        res.status(400).json({ success: false, message: "Invalid image type. Please upload a JPEG, PNG, or JPG image." });
        return;
    }
    fs_1.default.mkdirSync(deckPath, { recursive: true });
    fs_1.default.mkdirSync(additionalPath, { recursive: true });
    fs_1.default.mkdirSync(cardsPath, { recursive: true });
    if (thumbnail) {
        const tempPath = path_1.default.join(__dirname, "uploads", thumbnail.originalname);
        const targetPath = path_1.default.join(deckPath, thumbnail.originalname);
        fs_1.default.rename(tempPath, targetPath, (err) => {
            if (err) {
                res.status(500).json({ success: false, message: "Error moving thumbnail." });
                return;
            }
        });
    }
    const deckInfo = {
        deckName,
        description,
        editPassword,
        isPublic: isPublic === "true",
        usagePassword: isPublic === "true" ? null : usagePassword,
        thumbnail: thumbnail ? thumbnail.originalname : null,
        starred: false, // New entry
    };
    fs_1.default.writeFileSync(path_1.default.join(deckPath, "info.json"), JSON.stringify(deckInfo, null, 2));
    res.json({ success: true });
});
app.get("/search-decks", (req, res) => {
    const keyword = req.query.keyword;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const decksDir = path_1.default.join(__dirname, "decks");
    const decks = fs_1.default.readdirSync(decksDir).filter(deckName => {
        const deckInfoPath = path_1.default.join(decksDir, deckName, "important", "info.json");
        if (fs_1.default.existsSync(deckInfoPath)) {
            const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
            return deckInfo.deckName.includes(keyword) || deckInfo.description.includes(keyword);
        }
        return false;
    });
    const paginatedDecks = decks.slice((page - 1) * limit, page * limit).map(deckName => {
        const deckInfoPath = path_1.default.join(decksDir, deckName, "important", "info.json");
        const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
        return {
            deckName: deckInfo.deckName,
            description: deckInfo.description.length > 100 ? deckInfo.description.substring(0, 100) + "..." : deckInfo.description,
            thumbnail: deckInfo.thumbnail,
            starred: deckInfo.starred, // Include starred data
            cardCount: deckInfo.cardCount // Include cardCount data
        };
    });
    res.json({ decks: paginatedDecks, total: decks.length });
});
app.get("/deck-info", (req, res) => {
    const { deckName } = req.query;
    const deckInfoPath = path_1.default.join(__dirname, "decks", deckName, "important", "info.json");
    if (fs_1.default.existsSync(deckInfoPath)) {
        const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
        res.json({ success: true, deckInfo });
    }
    else {
        res.json({ success: false, message: "Deck not found." });
    }
});
app.post("/validate-deck-password", (req, res) => {
    const { deckName, editPassword } = req.body;
    const deckInfoPath = path_1.default.join(__dirname, "decks", deckName, "important", "info.json");
    if (fs_1.default.existsSync(deckInfoPath)) {
        const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
        if (deckInfo.editPassword === editPassword) {
            res.json({ success: true });
        }
        else {
            res.json({ success: false, message: "Invalid password." });
        }
    }
    else {
        res.json({ success: false, message: "Deck not found." });
    }
});
app.post("/validate-usage-password", (req, res) => {
    const { deckName, usagePassword } = req.body;
    const deckInfoPath = path_1.default.join(__dirname, "decks", deckName, "important", "info.json");
    if (fs_1.default.existsSync(deckInfoPath)) {
        const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
        if (deckInfo.usagePassword === usagePassword) {
            res.json({ success: true });
        }
        else {
            res.json({ success: false, message: "Invalid password." });
        }
    }
    else {
        res.json({ success: false, message: "Deck not found." });
    }
});
app.post("/edit-deck", upload.array("cards"), (req, res) => {
    const { deckName, editPassword, description, cardCount } = req.body; // Add cardCount to the request body
    const deckInfoPath = path_1.default.join(__dirname, "decks", deckName, "important", "info.json");
    if (fs_1.default.existsSync(deckInfoPath)) {
        const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
        if (deckInfo.editPassword === editPassword) {
            deckInfo.description = description;
            deckInfo.cardCount = parseInt(cardCount, 10); // Update cardCount
            fs_1.default.writeFileSync(deckInfoPath, JSON.stringify(deckInfo, null, 2));
            if (req.files) {
                req.files.forEach((file) => {
                    const tempPath = path_1.default.join(__dirname, "uploads", file.originalname);
                    const targetPath = path_1.default.join(__dirname, "decks", deckName, "cards", file.originalname);
                    fs_1.default.renameSync(tempPath, targetPath);
                });
            }
            res.json({ success: true });
        }
        else {
            res.json({ success: false, message: "Invalid password." });
        }
    }
    else {
        res.json({ success: false, message: "Deck not found." });
    }
});
app.post("/upload-cards", upload.array("cards"), (req, res) => {
    const { deckName } = req.body;
    const cardsDir = path_1.default.join(__dirname, "decks", deckName, "cards");
    if (!fs_1.default.existsSync(cardsDir)) {
        res.status(400).json({ success: false, message: "Deck not found." });
        return;
    }
    const existingFiles = fs_1.default.readdirSync(cardsDir).map(file => path_1.default.parse(file).name);
    if (req.files) {
        const files = req.files;
        for (const file of files) {
            const fileName = path_1.default.parse(file.originalname).name;
            if (existingFiles.includes(fileName)) {
                res.status(400).json({ success: false, message: `Duplicate file name: ${file.originalname}` });
                return;
            }
            const tempPath = path_1.default.join(__dirname, "uploads", file.originalname);
            const targetPath = path_1.default.join(cardsDir, file.originalname);
            fs_1.default.renameSync(tempPath, targetPath);
            const jsonContent = {
                description: "",
                additional: [],
                values: []
            };
            fs_1.default.writeFileSync(path_1.default.join(cardsDir, `${fileName}.json`), JSON.stringify(jsonContent, null, 2));
        }
    }
    res.json({ success: true });
});
app.get("/deck-cards", (req, res) => {
    const { deckName } = req.query;
    const cardsDir = path_1.default.join(__dirname, "decks", deckName, "cards");
    if (!fs_1.default.existsSync(cardsDir)) {
        res.status(400).json({ success: false, message: "Deck not found." });
        return;
    }
    const files = fs_1.default.readdirSync(cardsDir).filter(file => !file.endsWith(".json"));
    res.json({ success: true, files });
});
app.get("/card-info", (req, res) => {
    const { deckName, cardName } = req.query;
    console.log("Received card-info request:", { deckName, cardName });
    const cardBaseName = path_1.default.parse(cardName).name; // Get the base name without extension
    const cardInfoPath = path_1.default.join(__dirname, "decks", deckName, "cards", `${cardBaseName}.json`);
    if (!fs_1.default.existsSync(cardInfoPath)) {
        console.log("Card not found:", cardInfoPath);
        res.status(400).json({ success: false, message: "Card not found." });
        return;
    }
    const cardInfo = JSON.parse(fs_1.default.readFileSync(cardInfoPath, "utf-8"));
    console.log("Card info retrieved successfully:", cardInfo);
    res.json({ success: true, cardInfo });
});
app.post("/save-card", upload.array("additionalFiles"), (req, res) => {
    const { deckName, cardName, description, values } = req.body;
    console.log("Received save-card request:", { deckName, cardName, description, values });
    const cardBaseName = path_1.default.parse(cardName).name; // Get the base name without extension
    const cardInfoPath = path_1.default.join(__dirname, "decks", deckName, "cards", `${cardBaseName}.json`);
    if (!fs_1.default.existsSync(cardInfoPath)) {
        console.log("Card not found:", cardInfoPath);
        res.status(400).json({ success: false, message: "Card not found." });
        return;
    }
    const cardInfo = JSON.parse(fs_1.default.readFileSync(cardInfoPath, "utf-8"));
    cardInfo.description = description;
    cardInfo.values = JSON.parse(values);
    if (req.files) {
        const additionalFiles = req.files;
        const existingAdditionalFiles = cardInfo.additional || [];
        const newAdditionalFiles = additionalFiles.map(file => file.originalname);
        newAdditionalFiles.forEach(fileName => {
            const targetPath = path_1.default.join(__dirname, "decks", deckName, "additional", fileName);
            if (!fs_1.default.existsSync(targetPath)) {
                const tempPath = path_1.default.join(__dirname, "uploads", fileName);
                fs_1.default.renameSync(tempPath, targetPath);
            }
        });
        cardInfo.additional = [...existingAdditionalFiles, ...newAdditionalFiles];
    }
    fs_1.default.writeFileSync(cardInfoPath, JSON.stringify(cardInfo, null, 2));
    console.log("Card saved successfully:", cardInfoPath);
    res.json({ success: true });
});
app.post("/remove-additional-card", (req, res) => {
    const { deckName, cardName, additionalCardName } = req.body;
    console.log("Received remove-additional-card request:", { deckName, cardName, additionalCardName });
    const cardBaseName = path_1.default.parse(cardName).name; // Get the base name without extension
    const cardInfoPath = path_1.default.join(__dirname, "decks", deckName, "cards", `${cardBaseName}.json`);
    if (!fs_1.default.existsSync(cardInfoPath)) {
        console.log("Card not found:", cardInfoPath);
        res.status(400).json({ success: false, message: "Card not found." });
        return;
    }
    const cardInfo = JSON.parse(fs_1.default.readFileSync(cardInfoPath, "utf-8"));
    cardInfo.additional = cardInfo.additional.filter((name) => name !== additionalCardName);
    fs_1.default.writeFileSync(cardInfoPath, JSON.stringify(cardInfo, null, 2));
    console.log("Additional card removed successfully:", cardInfoPath);
    res.json({ success: true });
});
app.post("/delete-card-and-json", (req, res) => {
    const { deckName, cardName } = req.body;
    const cardPath = path_1.default.join(__dirname, "decks", deckName, "cards", cardName);
    const cardJsonPath = path_1.default.join(__dirname, "decks", deckName, "cards", `${path_1.default.parse(cardName).name}.json`);
    try {
        if (fs_1.default.existsSync(cardPath)) {
            fs_1.default.unlinkSync(cardPath);
        }
        if (fs_1.default.existsSync(cardJsonPath)) {
            fs_1.default.unlinkSync(cardJsonPath);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting card and JSON:", error);
        res.status(500).json({ success: false, message: "Error deleting card and JSON." });
    }
});
app.post("/save-konva-card", (req, res) => {
    const { roomName, card } = req.body;
    const konvaCardPath = path_1.default.join(__dirname, "lobbies", roomName, "konva", `${path_1.default.parse(card.src).name}.json`);
    if (!fs_1.default.existsSync(path_1.default.join(__dirname, "lobbies", roomName, "konva"))) {
        fs_1.default.mkdirSync(path_1.default.join(__dirname, "lobbies", roomName, "konva"), { recursive: true });
    }
    try {
        fs_1.default.writeFileSync(konvaCardPath, JSON.stringify(card.data, null, 2));
        res.json({ success: true });
    }
    catch (error) {
        console.error("Error saving card data:", error);
        res.status(500).json({ success: false, message: "Error saving card data." });
    }
});
app.post("/shuffle-in-card", (req, res) => {
    const { roomName, cardUrl, deckName } = req.body;
    const deckPath = path_1.default.join(__dirname, "lobbies", roomName, "decks", `${deckName}.json`);
    const konvaCardPath = path_1.default.join(__dirname, "lobbies", roomName, "konva", `${path_1.default.parse(cardUrl).name}.json`);
    if (!fs_1.default.existsSync(deckPath)) {
        res.status(400).json({ success: false, message: "Deck not found." });
        return;
    }
    const deckData = JSON.parse(fs_1.default.readFileSync(deckPath, "utf-8"));
    const formattedCardUrl = cardUrl.startsWith("http://localhost:3000") ? cardUrl.replace("http://localhost:3000", "") : cardUrl;
    deckData.cards.push(formattedCardUrl);
    // Shuffle the deck
    for (let i = deckData.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckData.cards[i], deckData.cards[j]] = [deckData.cards[j], deckData.cards[i]];
    }
    fs_1.default.writeFileSync(deckPath, JSON.stringify(deckData, null, 2));
    // Delete the Konva card file
    if (fs_1.default.existsSync(konvaCardPath)) {
        fs_1.default.unlinkSync(konvaCardPath);
    }
    res.json({ success: true });
});
app.post("/peek-deck", (req, res) => {
    const { roomName, deckName, count } = req.body;
    const deckPath = path_1.default.join(__dirname, "lobbies", roomName, "decks", `${deckName}.json`);
    if (!fs_1.default.existsSync(deckPath)) {
        res.status(400).json({ success: false, message: "Deck not found." });
        return;
    }
    const deckData = JSON.parse(fs_1.default.readFileSync(deckPath, "utf-8"));
    const cardsToPeek = deckData.cards.slice(0, count);
    res.json({ success: true, cards: cardsToPeek });
});
app.post("/upload-card-image", upload.single("cardImage"), (req, res) => {
    const { roomName, username } = req.body;
    const cardImage = req.file;
    if (!cardImage) {
        res.status(400).json({ success: false, message: "No image uploaded." });
        return;
    }
    const uploadsDir = path_1.default.join(__dirname, "lobbies", roomName, "uploads");
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    const targetPath = path_1.default.join(uploadsDir, cardImage.originalname);
    fs_1.default.renameSync(cardImage.path, targetPath);
    const cardUrl = `/lobbies/${roomName}/uploads/${cardImage.originalname}`;
    const handPath = path_1.default.join(__dirname, "lobbies", roomName, "hands", `${username}.json`);
    if (fs_1.default.existsSync(handPath)) {
        const handData = JSON.parse(fs_1.default.readFileSync(handPath, "utf-8"));
        const blankCardIndex = handData.hand.findIndex((card) => card.includes("BLANK.png"));
        if (blankCardIndex > -1) {
            handData.hand.splice(blankCardIndex, 1);
        }
        handData.hand.push(cardUrl);
        fs_1.default.writeFileSync(handPath, JSON.stringify(handData, null, 2));
        res.json({ success: true, cardUrl });
    }
    else {
        res.status(404).json({ success: false, message: "Hand data not found." });
    }
});
// Create a new score type
app.post("/create-score", (req, res) => {
    const { roomName, scoreName, defaultValue } = req.body;
    const settingsPath = path_1.default.join(__dirname, "lobbies", roomName, "settings.json");
    if (!fs_1.default.existsSync(settingsPath)) {
        res.status(400).json({ success: false, message: "Room not found." });
        return;
    }
    const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, "utf-8"));
    if (!settings.scores[scoreName]) {
        settings.scores[scoreName] = settings.scores.Points.map((player) => ({ name: player.name, value: defaultValue }));
        fs_1.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        const io = req.app.get('io');
        io.to(roomName).emit("updateScores", settings.scores); // Emit updated scores to all players in the room
        console.log("Sent updateScores event to room:", roomName, settings.scores); // Log when the server sends the updated scores
        res.json({ success: true });
    }
    else {
        res.status(400).json({ success: false, message: "Score type already exists." });
    }
});
// Delete a score type
app.post("/delete-score", (req, res) => {
    const { roomName, scoreName } = req.body;
    const settingsPath = path_1.default.join(__dirname, "lobbies", roomName, "settings.json");
    if (!fs_1.default.existsSync(settingsPath)) {
        res.status(400).json({ success: false, message: "Room not found." });
        return;
    }
    const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, "utf-8"));
    if (settings.scores[scoreName]) {
        delete settings.scores[scoreName];
        fs_1.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        const io = req.app.get('io');
        io.to(roomName).emit("updateScores", settings.scores); // Emit updated scores to all players in the room
        console.log("Sent updateScores event to room:", roomName, settings.scores); // Log when the server sends the updated scores
        res.json({ success: true });
    }
    else {
        res.status(400).json({ success: false, message: "Score type not found." });
    }
});
// Get current scores
app.get("/scores", (req, res) => {
    const { roomName } = req.query;
    const settingsPath = path_1.default.join(__dirname, "lobbies", roomName, "settings.json");
    if (!fs_1.default.existsSync(settingsPath)) {
        res.status(400).json({ success: false, message: "Room not found." });
        return;
    }
    const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, "utf-8"));
    res.json({ success: true, scores: settings.scores });
});
app.post("/update-score", (req, res) => {
    const { roomName, scoreName, playerName, newValue } = req.body;
    const settingsPath = path_1.default.join(__dirname, "lobbies", roomName, "settings.json");
    if (!fs_1.default.existsSync(settingsPath)) {
        res.status(400).json({ success: false, message: "Room not found." });
        return;
    }
    const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, "utf-8"));
    const playerScore = settings.scores[scoreName].find((player) => player.name === playerName);
    if (playerScore) {
        playerScore.value = newValue;
        fs_1.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        const io = req.app.get('io');
        io.to(roomName).emit("updateScores", settings.scores); // Emit updated scores to all players in the room
        console.log("Sent updateScores event to room:", roomName, settings.scores); // Log when the server sends the updated scores
        res.json({ success: true });
    }
    else {
        res.status(400).json({ success: false, message: "Player not found." });
    }
});
// Clear the lobbies folder when the server starts
const lobbiesPath = path_1.default.join(__dirname, "lobbies");
if (fs_1.default.existsSync(lobbiesPath)) {
    fs_1.default.readdirSync(lobbiesPath).forEach(file => {
        const filePath = path_1.default.join(lobbiesPath, file);
        fs_1.default.rmSync(filePath, { recursive: true, force: true });
    });
    console.log("Lobbies folder cleared.");
}
else {
    fs_1.default.mkdirSync(lobbiesPath, { recursive: true });
    console.log("Lobbies folder created.");
}
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // Allow requests from this origin
        methods: ["GET", "POST"]
    }
});
// Ensure io is accessible in the routes
app.set('io', io);
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
const rooms = {};
// Function to add a card to a player's hand
function addCardToHand(roomName, username, card, isHost) {
    const handPath = path_1.default.join(__dirname, "lobbies", roomName, "hands", `${username}.json`);
    if (fs_1.default.existsSync(handPath)) {
        const handData = JSON.parse(fs_1.default.readFileSync(handPath, "utf-8"));
        handData.hand.push(card);
        fs_1.default.writeFileSync(handPath, JSON.stringify(handData, null, 2));
    }
    else {
        const handData = { hand: [card], isHost };
        fs_1.default.writeFileSync(handPath, JSON.stringify(handData, null, 2));
    }
}
// Function to log an action
function logAction(roomName, message, backgroundColor) {
    const formattedMessage = `<span style="background-color: ${backgroundColor}; padding: 5px; border-radius: 5px;"><b>${message}</b></span>`;
    if (rooms[roomName]) {
        rooms[roomName].messages.push(formattedMessage);
        io.to(roomName).emit("chatMessage", formattedMessage);
    }
}
// Function to get card data
function getCardData(card) {
    const cardPath = path_1.default.join(__dirname, card.replace("http://localhost:3000", ""));
    const cardJsonPath = cardPath.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json");
    if (fs_1.default.existsSync(cardJsonPath)) {
        return JSON.parse(fs_1.default.readFileSync(cardJsonPath, "utf-8"));
    }
    return null;
}
// Function to add an image to the Konva canvas
function addImageToCanvas(roomName, imageUrl, x, y, width, height, data) {
    const image = { x: x + 50, y: y + 50, width, height, src: imageUrl, data }; // Adjusted to be more to the right and lower
    if (rooms[roomName]) {
        rooms[roomName].images.push(image); // Store image data on the server
        io.to(roomName).emit("updateImages", rooms[roomName].images); // Send updated images to clients
        console.log(`Added image to canvas: ${imageUrl}`);
    }
    else {
        console.error(`Room ${roomName} does not exist.`);
    }
}
io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    // Host a room
    socket.on("hostRoom", ({ username }) => {
        const roomName = (0, uuid_1.v4)();
        const player = { id: socket.id, username, isHost: true };
        rooms[roomName] = { players: [player], images: [], gameStarted: false, messages: [], scores: {}, infiniteMode: false, chaosMode: false, blankCards: 0 }; // Initialize scores
        socket.join(roomName);
        // Notify the host of the room name and updated state
        socket.emit("roomCreated", { roomName, roomState: rooms[roomName] });
        console.log(`${username} hosted room ${roomName}`);
    });
    // Join a room
    socket.on("joinRoom", ({ roomName, username, isHost }) => {
        if (!rooms[roomName]) {
            rooms[roomName] = { players: [], images: [], gameStarted: false, messages: [], scores: {}, infiniteMode: false, chaosMode: false, blankCards: 0 }; // Initialize scores
        }
        // Handle duplicate names
        let uniqueUsername = username;
        let counter = 1;
        while (rooms[roomName].players.some(player => player.username === uniqueUsername)) {
            uniqueUsername = `${username}${counter}`;
            counter++;
        }
        const player = { id: socket.id, username: uniqueUsername, isHost };
        rooms[roomName].players.push(player);
        socket.join(roomName);
        // Notify everyone in the room of the updated state
        io.to(roomName).emit("updateRoom", rooms[roomName]);
        console.log(`${uniqueUsername} joined room ${roomName}`);
    });
    // Function to shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    // Function to double shuffle an array
    function doubleShuffle(array) {
        return shuffleArray(shuffleArray(array));
    }
    // Function to get a random card from all public decks
    function getRandomCardFromPublicDecks() {
        return __awaiter(this, void 0, void 0, function* () {
            const decksDir = path_1.default.join(__dirname, "decks");
            const publicDecks = fs_1.default.readdirSync(decksDir).filter(deckName => {
                const deckInfoPath = path_1.default.join(decksDir, deckName, "important", "info.json");
                if (fs_1.default.existsSync(deckInfoPath)) {
                    const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
                    return deckInfo.isPublic;
                }
                return false;
            });
            const totalCards = publicDecks.reduce((acc, deckName) => {
                const deckInfoPath = path_1.default.join(decksDir, deckName, "important", "info.json");
                const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
                return acc + deckInfo.cardCount;
            }, 0);
            const randomIndex = Math.floor(Math.random() * totalCards);
            let currentIndex = 0;
            for (const deckName of publicDecks) {
                const deckInfoPath = path_1.default.join(decksDir, deckName, "important", "info.json");
                const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
                if (randomIndex < currentIndex + deckInfo.cardCount) {
                    const cardIndex = randomIndex - currentIndex;
                    const cardsDir = path_1.default.join(decksDir, deckName, "cards");
                    const cardFiles = fs_1.default.readdirSync(cardsDir).filter(file => !file.endsWith(".json"));
                    return `/decks/${deckName}/cards/${cardFiles[cardIndex]}`;
                }
                currentIndex += deckInfo.cardCount;
            }
            throw new Error("Failed to select a random card from public decks.");
        });
    }
    // Function to get the total number of cards in all public decks
    function getTotalCardsInPublicDecks() {
        return __awaiter(this, void 0, void 0, function* () {
            const decksDir = path_1.default.join(__dirname, "decks");
            const publicDecks = fs_1.default.readdirSync(decksDir).filter(deckName => {
                const deckInfoPath = path_1.default.join(decksDir, deckName, "important", "info.json");
                if (fs_1.default.existsSync(deckInfoPath)) {
                    const deckInfo = JSON.parse(fs_1.default.readFileSync(deckInfoPath, "utf-8"));
                    return deckInfo.isPublic;
                }
                return false;
            });
            let totalCards = 0;
            for (const deckName of publicDecks) {
                const cardsPath = path_1.default.join(decksDir, deckName, "cards");
                if (fs_1.default.existsSync(cardsPath)) {
                    const cardFiles = fs_1.default.readdirSync(cardsPath).filter(file => !file.endsWith(".json"));
                    totalCards += cardFiles.length;
                }
            }
            return totalCards;
        });
    }
    // Function to draw a card from a deck
    function drawCard(deck, blankCards, isMainDeck, infiniteMode, chaosMode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(deck)) {
                throw new Error("Invalid deck format.");
            }
            const deckLength = deck.length;
            const totalLength = isMainDeck ? deckLength + blankCards : deckLength;
            const randomIndex = Math.floor(Math.random() * totalLength);
            if (isMainDeck && chaosMode) {
                const totalCards = yield getTotalCardsInPublicDecks();
                const blankCardChance = blankCards / totalCards;
                if (Math.random() < blankCardChance) {
                    return { card: "/assets/BLANK.png", blankCards };
                }
                return { card: yield getRandomCardFromPublicDecks(), blankCards };
            }
            if (isMainDeck && randomIndex >= deckLength) {
                return { card: "/assets/BLANK.png", blankCards: infiniteMode ? blankCards : blankCards - 1 };
            }
            if (!isMainDeck && deckLength === 0) {
                return { card: null, blankCards };
            }
            const card = deck[randomIndex];
            if (!infiniteMode) {
                deck.splice(randomIndex, 1);
            }
            return { card, blankCards };
        });
    }
    // Start game
    socket.on("startGame", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomName, selectedDecks = [], additionalDecks = [], infiniteMode = false, chaosMode = false, blankCards = 0 }) {
        console.log("Starting game with selectedDecks:", selectedDecks);
        console.log("Starting game with additionalDecks:", additionalDecks);
        console.log("Game settings:", { infiniteMode, chaosMode, blankCards });
        if (rooms[roomName]) {
            rooms[roomName].gameStarted = true; // Set gameStarted flag
            // Create a new folder for the lobby
            const lobbyPath = path_1.default.join(__dirname, "lobbies", roomName);
            fs_1.default.mkdirSync(lobbyPath, { recursive: true });
            console.log(`Lobby folder created: ${lobbyPath}`);
            // Create a new folder for the decks
            const decksPath = path_1.default.join(lobbyPath, "decks");
            fs_1.default.mkdirSync(decksPath, { recursive: true });
            console.log(`Decks folder created: ${decksPath}`);
            // Create a hand folder
            const handsPath = path_1.default.join(lobbyPath, "hands");
            fs_1.default.mkdirSync(handsPath, { recursive: true });
            console.log(`Hands folder created: ${handsPath}`);
            // Create an uploads folder
            const uploadsPath = path_1.default.join(lobbyPath, "uploads");
            fs_1.default.mkdirSync(uploadsPath, { recursive: true });
            console.log(`Uploads folder created: ${uploadsPath}`);
            // Initialize scores
            const scores = {
                Points: rooms[roomName].players.map(player => ({ name: player.username, value: 0 }))
            };
            // Store lobby settings
            const settings = { infiniteMode, chaosMode, blankCards, logMoves: false, scores }; // Add scores to settings
            fs_1.default.writeFileSync(path_1.default.join(lobbyPath, "settings.json"), JSON.stringify(settings, null, 2));
            console.log(`Lobby settings saved: ${JSON.stringify(settings)}`);
            // Emit settings to clients
            io.to(roomName).emit("gameSettings", settings);
            // Create main.json for the main deck
            let mainDeck = [];
            for (const deck of selectedDecks) {
                const deckPath = path_1.default.join(__dirname, "decks", deck.deckName, "cards");
                console.log(`Reading cards from: ${deckPath}`);
                if (fs_1.default.existsSync(deckPath)) {
                    const cardFiles = fs_1.default.readdirSync(deckPath).filter(file => !file.endsWith(".json"));
                    console.log(`Found card files: ${cardFiles}`);
                    for (const cardFile of cardFiles) {
                        mainDeck.push(`/decks/${deck.deckName}/cards/${cardFile}`);
                    }
                }
                else {
                    console.error(`Deck path does not exist: ${deckPath}`);
                }
            }
            mainDeck = doubleShuffle(mainDeck); // Double shuffle the main deck
            fs_1.default.writeFileSync(path_1.default.join(decksPath, "main.json"), JSON.stringify({ cards: mainDeck }, null, 2));
            console.log(`Main deck created with ${mainDeck.length} cards`);
            // Create discard.json for the discard pile
            fs_1.default.writeFileSync(path_1.default.join(decksPath, "discard.json"), JSON.stringify({ cards: [] }, null, 2));
            console.log(`Discard pile created as discard.json`);
            // Create individual JSON files for additional decks
            for (const deck of additionalDecks) {
                let additionalDeck = [];
                const deckPath = path_1.default.join(__dirname, "decks", deck.deckName, "cards");
                console.log(`Reading cards from: ${deckPath}`);
                if (fs_1.default.existsSync(deckPath)) {
                    const cardFiles = fs_1.default.readdirSync(deckPath).filter(file => !file.endsWith(".json"));
                    console.log(`Found card files: ${cardFiles}`);
                    for (const cardFile of cardFiles) {
                        additionalDeck.push(`/decks/${deck.deckName}/cards/${cardFile}`);
                    }
                    additionalDeck = doubleShuffle(additionalDeck); // Double shuffle the additional deck
                    let additionalDeckFileName = `${deck.deckName}.json`;
                    let counter = 1;
                    while (fs_1.default.existsSync(path_1.default.join(decksPath, additionalDeckFileName))) {
                        additionalDeckFileName = `${deck.deckName}_${counter}.json`;
                        counter++;
                    }
                    fs_1.default.writeFileSync(path_1.default.join(decksPath, additionalDeckFileName), JSON.stringify({ deckName: deck.deckName, cards: additionalDeck }, null, 2));
                    console.log(`Additional deck created: ${additionalDeckFileName} with ${additionalDeck.length} cards`);
                }
                else {
                    console.error(`Deck path does not exist: ${deckPath}`);
                }
            }
            // Create a JSON file for each player in the hands folder
            rooms[roomName].players.forEach(player => {
                const playerHandPath = path_1.default.join(handsPath, `${player.username}.json`);
                const handData = { hand: [], isHost: player.isHost }; // Initialize hand with isHost value
                fs_1.default.writeFileSync(playerHandPath, JSON.stringify(handData, null, 2));
                console.log(`Hand file created for player: ${player.username}`);
            });
            rooms[roomName].infiniteMode = infiniteMode;
            rooms[roomName].chaosMode = chaosMode;
            rooms[roomName].blankCards = blankCards;
            console.log(`Starting game in room ${roomName}`);
            io.to(roomName).emit("gameStarted");
        }
    }));
    // Join game
    socket.on("joinGame", ({ roomName, username }) => {
        if (rooms[roomName]) {
            console.log(`${username} joined game in room ${roomName}`);
            socket.join(roomName);
            socket.emit("updateImages", rooms[roomName].images); // Send images to the client
            socket.emit("chatMessage", rooms[roomName].messages); // Send existing messages to the new user
        }
        else {
            console.error(`Room ${roomName} does not exist.`);
            socket.emit("error", { message: `Room ${roomName} does not exist.` });
        }
    });
    // Handle chat messages
    socket.on("chatMessage", ({ roomName, message }) => {
        if (rooms[roomName]) {
            rooms[roomName].messages.push(message);
            io.to(roomName).emit("chatMessage", message);
        }
    });
    // End game
    socket.on("endGame", ({ roomName }) => {
        if (rooms[roomName]) {
            delete rooms[roomName];
            // Delete the lobby folder if it exists
            const lobbyPath = path_1.default.join(__dirname, "lobbies", roomName);
            if (fs_1.default.existsSync(lobbyPath)) {
                fs_1.default.rmSync(lobbyPath, { recursive: true, force: true });
                console.log(`Lobby folder deleted: ${lobbyPath}`);
            }
        }
    });
    // Leave a room
    socket.on("leaveRoom", ({ roomName }) => {
        const room = rooms[roomName];
        if (room) {
            room.players = room.players.filter((player) => player.id !== socket.id);
            socket.leave(roomName);
            // Notify everyone in the room of the updated state
            io.to(roomName).emit("updateRoom", room);
            // Cleanup if the room is empty and the game has not started
            if (room.players.length === 0 && !room.gameStarted) {
                delete rooms[roomName];
                // Delete the lobby folder if it exists
                const lobbyPath = path_1.default.join(__dirname, "lobbies", roomName);
                if (fs_1.default.existsSync(lobbyPath)) {
                    fs_1.default.rmSync(lobbyPath, { recursive: true, force: true });
                    console.log(`Lobby folder deleted: ${lobbyPath}`);
                }
            }
        }
    });
    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (const roomName in rooms) {
            const room = rooms[roomName];
            room.players = room.players.filter((player) => player.id !== socket.id);
            io.to(roomName).emit("updateRoom", room);
            // Only delete the room if there are no players left and the game has not started
            if (room.players.length === 0 && !room.gameStarted) {
                delete rooms[roomName];
                // Delete the lobby folder if it exists
                const lobbyPath = path_1.default.join(__dirname, "lobbies", roomName);
                if (fs_1.default.existsSync(lobbyPath)) {
                    fs_1.default.rmSync(lobbyPath, { recursive: true, force: true });
                    console.log(`Lobby folder deleted: ${lobbyPath}`);
                }
            }
        }
    });
    // Draw card event
    socket.on("drawCard", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomName, username, deckName }) {
        const lobbyPath = path_1.default.join(__dirname, "lobbies", roomName);
        const settingsPath = path_1.default.join(lobbyPath, "settings.json");
        if (!fs_1.default.existsSync(settingsPath)) {
            console.error(`Room ${roomName} does not exist.`);
            socket.emit("error", { message: `Room ${roomName} does not exist.` });
            return;
        }
        const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, "utf-8"));
        let { blankCards, infiniteMode, chaosMode } = settings;
        const deckPath = path_1.default.join(lobbyPath, "decks", `${deckName}.json`);
        if (fs_1.default.existsSync(deckPath)) {
            const deckData = JSON.parse(fs_1.default.readFileSync(deckPath, "utf-8"));
            const isMainDeck = deckName === "main";
            const { card, blankCards: updatedBlankCards } = yield drawCard(deckData.cards, blankCards, isMainDeck, isMainDeck ? false : infiniteMode, isMainDeck ? chaosMode : false);
            blankCards = updatedBlankCards;
            if (card) {
                addCardToHand(roomName, username, card, false);
            }
            fs_1.default.writeFileSync(deckPath, JSON.stringify(deckData, null, 2));
            fs_1.default.writeFileSync(settingsPath, JSON.stringify(Object.assign(Object.assign({}, settings), { blankCards }), null, 2));
            console.log(`Card drawn: ${card} by ${username} from ${deckName}`);
            logAction(roomName, `<b>${username}</b> drew a card from <b>${deckName}</b>`, "#ffcccc"); // Red background
        }
        else {
            console.error(`Deck not found: ${deckPath}`);
        }
    }));
    // Deal card event
    socket.on("dealCard", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomName, username, deckName }) {
        console.log(`Received dealCard event from ${username} in room ${roomName} using deck ${deckName}`);
        const lobbyPath = path_1.default.join(__dirname, "lobbies", roomName);
        const settingsPath = path_1.default.join(lobbyPath, "settings.json");
        if (!fs_1.default.existsSync(settingsPath)) {
            console.error(`Room ${roomName} does not exist.`);
            socket.emit("error", { message: `Room ${roomName} does not exist.` });
            return;
        }
        const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, "utf-8"));
        let { blankCards, infiniteMode, chaosMode } = settings;
        const deckPath = path_1.default.join(lobbyPath, "decks", `${deckName}.json`);
        if (fs_1.default.existsSync(deckPath)) {
            const deckData = JSON.parse(fs_1.default.readFileSync(deckPath, "utf-8"));
            const isMainDeck = deckName === "main";
            const { card, blankCards: updatedBlankCards } = yield drawCard(deckData.cards, blankCards, isMainDeck, isMainDeck ? false : infiniteMode, isMainDeck ? chaosMode : false);
            blankCards = updatedBlankCards;
            if (Array.isArray(deckData.cards)) {
                if (deckData.cards.length === 0 && blankCards === 0) {
                    logAction(roomName, "No cards left to deal", "#ffcccc"); // Red background
                    return;
                }
                const handsPath = path_1.default.join(lobbyPath, "hands");
                const playerFiles = fs_1.default.readdirSync(handsPath).filter(file => file.endsWith(".json"));
                for (const file of playerFiles) {
                    const playerName = path_1.default.parse(file).name;
                    const { card, blankCards: updatedBlankCards } = yield drawCard(deckData.cards, blankCards, deckName === "main", infiniteMode, chaosMode);
                    blankCards = updatedBlankCards;
                    if (card) {
                        addCardToHand(roomName, playerName, card, false);
                    }
                    //console.log(`Dealt card: ${card} to player: ${playerName}`);
                }
                fs_1.default.writeFileSync(deckPath, JSON.stringify(deckData, null, 2));
                fs_1.default.writeFileSync(settingsPath, JSON.stringify(Object.assign(Object.assign({}, settings), { blankCards }), null, 2));
                console.log(`Updated deck data saved for ${deckName}`);
                logAction(roomName, `<b>${username}</b> dealt a card to each player`, "#ffcc99"); // Orange background
                io.to(roomName).emit("updateHands"); // Notify clients to update hands
            }
            else {
                console.error(`Invalid deck format: ${deckPath}`);
            }
        }
        else {
            console.error(`Deck not found: ${deckPath}`);
        }
    }));
    // Function to remove a card from a player's hand
    function removeCardFromHand(roomName, username, card, originalCard) {
        const handPath = path_1.default.join(__dirname, "lobbies", roomName, "hands", `${username}.json`);
        const cardPath = card.replace("http://localhost:3000", ""); // Ensure the card URL is consistent
        const originalCardPath = originalCard ? originalCard.replace("http://localhost:3000", "") : null;
        console.log(`=== HAND: Removing card from hand. Room: ${roomName}, Username: ${username}, Card: ${cardPath}, Original Card: ${originalCardPath}`);
        if (fs_1.default.existsSync(handPath)) {
            const handData = JSON.parse(fs_1.default.readFileSync(handPath, "utf-8"));
            console.log(`=== HAND: Current hand data: ${JSON.stringify(handData.hand)}`);
            const cardIndex = handData.hand.indexOf(originalCardPath || cardPath);
            if (cardIndex > -1) {
                handData.hand.splice(cardIndex, 1); // Remove only one instance of the card
                console.log(`=== HAND: Card removed. Updated hand data: ${JSON.stringify(handData.hand)}`);
            }
            else {
                console.log(`=== HAND: Card not found in hand.`);
            }
            fs_1.default.writeFileSync(handPath, JSON.stringify(handData, null, 2));
        }
        else {
            console.log(`=== HAND: Hand file not found for player: ${username}`);
        }
    }
    // Handle play card event
    socket.on("playCard", ({ roomName, username, card, width, height, data }) => {
        const cardUrl = card.startsWith("/assets/") ? `http://localhost:3000${card}` : card; // Construct the card URL
        console.log(`=== HAND: Playing card. Room: ${roomName}, Username: ${username}, Card: ${cardUrl}, Width: ${width}, Height: ${height}`);
        const cardData = data || getCardData(cardUrl);
        console.log(`=== HAND: Card data: ${JSON.stringify(cardData)}`);
        addImageToCanvas(roomName, cardUrl, 50, 50, width, height, cardData); // Add image to canvas at position (50, 50)
        removeCardFromHand(roomName, username, cardUrl, data === null || data === void 0 ? void 0 : data.originalCard); // Remove the card URL from the player's hand
        logAction(roomName, `<b>${username}</b> played a card`, "#ffff99"); // Yellow background
        io.to(roomName).emit("updateHands");
    });
    // Handle discard card event
    socket.on("discardCard", ({ roomName, username, card }) => {
        const discardPath = path_1.default.join(__dirname, "lobbies", roomName, "decks", "discard.json");
        if (fs_1.default.existsSync(discardPath)) {
            const discardData = JSON.parse(fs_1.default.readFileSync(discardPath, "utf-8"));
            const formattedCardUrl = card.startsWith("http://localhost:3000") ? card.replace("http://localhost:3000", "") : card;
            discardData.cards.unshift(formattedCardUrl); // Add the newest entry to the very first index
            fs_1.default.writeFileSync(discardPath, JSON.stringify(discardData, null, 2));
        }
        removeCardFromHand(roomName, username, card);
        logAction(roomName, `<b>${username}</b> discarded a card`, "#cccccc"); // Grey background
        io.to(roomName).emit("updateHands");
    });
    // Update image positions
    socket.on("updateImagePositions", ({ roomName, images }) => {
        if (rooms[roomName]) {
            rooms[roomName].images = images;
            io.to(roomName).emit("updateImages", rooms[roomName].images);
        }
    });
    socket.on("shuffleInCard", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomName, cardUrl, deckName }) {
        try {
            const response = yield axios_1.default.post("http://localhost:3000/shuffle-in-card", { roomName, cardUrl, deckName });
            if (response.data.success) {
                const updatedImages = rooms[roomName].images.filter(img => img.src !== cardUrl);
                rooms[roomName].images = updatedImages;
                io.to(roomName).emit("updateImages", updatedImages);
            }
        }
        catch (error) {
            console.error("Error shuffling in card:", error);
        }
    }));
    socket.on("drawCardToField", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomName, username, deckName }) {
        const lobbyPath = path_1.default.join(__dirname, "lobbies", roomName);
        const settingsPath = path_1.default.join(lobbyPath, "settings.json");
        if (!fs_1.default.existsSync(settingsPath)) {
            console.error(`Room ${roomName} does not exist.`);
            socket.emit("error", { message: `Room ${roomName} does not exist.` });
            return;
        }
        const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, "utf-8"));
        let { blankCards, infiniteMode, chaosMode } = settings;
        const deckPath = path_1.default.join(lobbyPath, "decks", `${deckName}.json`);
        if (fs_1.default.existsSync(deckPath)) {
            const deckData = JSON.parse(fs_1.default.readFileSync(deckPath, "utf-8"));
            if (Array.isArray(deckData.cards)) {
                if (deckData.cards.length === 0 && blankCards === 0) {
                    logAction(roomName, "No cards left to draw", "#ffcccc"); // Red background
                    return;
                }
                const { card, blankCards: updatedBlankCards } = yield drawCard(deckData.cards, blankCards, deckName === "main", infiniteMode, chaosMode);
                blankCards = updatedBlankCards;
                fs_1.default.writeFileSync(deckPath, JSON.stringify(deckData, null, 2));
                fs_1.default.writeFileSync(settingsPath, JSON.stringify(Object.assign(Object.assign({}, settings), { blankCards }), null, 2));
                console.log(`Card drawn to field: ${card} by ${username} from ${deckName}`);
                const flippedCardUrl = "http://localhost:3000/assets/FLIPPED.png";
                const cardData = { originalCard: `http://localhost:3000${card}` };
                const newCard = {
                    x: 50 + 50, // Adjusted to be more to the right
                    y: 50 + 50, // Adjusted to be lower
                    width: 100,
                    height: 100, // Set a fixed height
                    src: flippedCardUrl,
                    data: cardData,
                };
                if (rooms[roomName]) {
                    rooms[roomName].images.push(newCard);
                    io.to(roomName).emit("updateImages", rooms[roomName].images);
                }
                logAction(roomName, `<b>${username}</b> drew a card to the field from <b>${deckName}</b>`, "#ffcccc"); // Red background
            }
            else {
                console.error(`Invalid deck format: ${deckPath}`);
            }
        }
        else {
            console.error(`Deck not found: ${deckPath}`);
        }
    }));
    // Handle score updates
    socket.on("updateScores", (updatedScores) => {
        const { roomName, scores } = updatedScores;
        if (rooms[roomName]) {
            rooms[roomName].scores = scores;
            io.to(roomName).emit("updateScores", scores);
        }
    });
    socket.on("stealCard", ({ roomName, thief, victim, cardIndex }) => {
        const victimHandPath = path_1.default.join(__dirname, "lobbies", roomName, "hands", `${victim}.json`);
        const thiefHandPath = path_1.default.join(__dirname, "lobbies", roomName, "hands", `${thief}.json`);
        if (fs_1.default.existsSync(victimHandPath) && fs_1.default.existsSync(thiefHandPath)) {
            const victimHandData = JSON.parse(fs_1.default.readFileSync(victimHandPath, "utf-8"));
            const thiefHandData = JSON.parse(fs_1.default.readFileSync(thiefHandPath, "utf-8"));
            if (victimHandData.hand[cardIndex]) {
                const stolenCard = victimHandData.hand.splice(cardIndex, 1)[0];
                thiefHandData.hand.push(stolenCard);
                fs_1.default.writeFileSync(victimHandPath, JSON.stringify(victimHandData, null, 2));
                fs_1.default.writeFileSync(thiefHandPath, JSON.stringify(thiefHandData, null, 2));
                io.to(roomName).emit("updateHands");
                io.to(victimHandPath).emit("forceCloseHandPopup");
            }
        }
    });
    app.get("/lobbies/:roomName/hands/:username", (req, res) => {
        const { roomName, username } = req.params;
        const handPath = path_1.default.join(__dirname, "lobbies", roomName, "hands", `${username}.json`);
        if (fs_1.default.existsSync(handPath)) {
            const handData = JSON.parse(fs_1.default.readFileSync(handPath, "utf-8"));
            res.json(handData);
        }
        else {
            res.status(404).json({ success: false, message: "Hand data not found." });
        }
    });
    app.get("/lobbies/:roomName/decks", (req, res) => {
        const { roomName } = req.params;
        const decksPath = path_1.default.join(__dirname, "lobbies", roomName, "decks");
        if (!fs_1.default.existsSync(decksPath)) {
            res.status(404).json({ success: false, message: "Decks not found." });
            return;
        }
        const decks = fs_1.default.readdirSync(decksPath).map(deckFile => path_1.default.parse(deckFile).name);
        res.json({ success: true, decks });
    });
    app.get("/lobbies/:roomName/players", (req, res) => {
        const { roomName } = req.params;
        const handsDir = path_1.default.join(__dirname, "lobbies", roomName, "hands");
        if (fs_1.default.existsSync(handsDir)) {
            try {
                const playerFiles = fs_1.default.readdirSync(handsDir).filter(file => file.endsWith(".json"));
                const players = playerFiles.map(file => path_1.default.parse(file).name);
                console.log("Players found:", players); // Log the players found
                res.json({ success: true, players });
            }
            catch (error) {
                console.error("Error reading hands directory:", error); // Log any errors
                res.status(500).json({ success: false, message: "Error reading hands directory." });
            }
        }
        else {
            console.error("Lobby not found:", handsDir); // Log if the lobby is not found
            res.status(404).json({ success: false, message: "Lobby not found." });
        }
    });
});
app.get("/lobbies/:roomName/decks", (req, res) => {
    const { roomName } = req.params;
    const decksPath = path_1.default.join(__dirname, "lobbies", roomName, "decks");
    if (!fs_1.default.existsSync(decksPath)) {
        res.status(404).json({ success: false, message: "Decks not found." });
        return;
    }
    const decks = fs_1.default.readdirSync(decksPath).map(deckFile => path_1.default.parse(deckFile).name);
    res.json({ success: true, decks });
});
app.get("/lobbies/:roomName/players", (req, res) => {
    const { roomName } = req.params;
    const handsDir = path_1.default.join(__dirname, "lobbies", roomName, "hands");
    if (fs_1.default.existsSync(handsDir)) {
        try {
            const playerFiles = fs_1.default.readdirSync(handsDir).filter(file => file.endsWith(".json"));
            const players = playerFiles.map(file => path_1.default.parse(file).name);
            console.log("Players found:", players); // Log the players found
            res.json({ success: true, players });
        }
        catch (error) {
            console.error("Error reading hands directory:", error); // Log any errors
            res.status(500).json({ success: false, message: "Error reading hands directory." });
        }
    }
    else {
        console.error("Lobby not found:", handsDir); // Log if the lobby is not found
        res.status(404).json({ success: false, message: "Lobby not found." });
    }
});
app.post("/add-card-to-hand", (req, res) => {
    const { roomName, username, cardUrl } = req.body;
    const handPath = path_1.default.join(__dirname, "lobbies", roomName, "hands", `${username}.json`);
    if (fs_1.default.existsSync(handPath)) {
        const handData = JSON.parse(fs_1.default.readFileSync(handPath, "utf-8"));
        handData.hand.push(cardUrl);
        fs_1.default.writeFileSync(handPath, JSON.stringify(handData, null, 2));
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false, message: "Hand data not found." });
    }
});
