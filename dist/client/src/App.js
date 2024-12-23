"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
// Import your components
const MainMenu_1 = __importDefault(require("./MainMenu")); // This will be your default screen
const LobbyScreen_1 = __importDefault(require("./LobbyScreen"));
const EditCards_1 = __importDefault(require("./EditCards"));
const CreateDeck_1 = __importDefault(require("./CreateDeck"));
const EditDeck_1 = __importDefault(require("./EditDeck"));
const DeckEditing_1 = __importDefault(require("./DeckEditing"));
const Game_1 = __importDefault(require("./Game"));
const App = () => {
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(MainMenu_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/lobby", element: (0, jsx_runtime_1.jsx)(LobbyScreen_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/edit-cards", element: (0, jsx_runtime_1.jsx)(EditCards_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/create-deck", element: (0, jsx_runtime_1.jsx)(CreateDeck_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/edit-deck", element: (0, jsx_runtime_1.jsx)(EditDeck_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/deck-editing", element: (0, jsx_runtime_1.jsx)(DeckEditing_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/game", element: (0, jsx_runtime_1.jsx)(Game_1.default, {}) })] }) }));
};
exports.default = App;
