"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = __importDefault(require("react-dom/client"));
const App_1 = __importDefault(require("./App")); // Assuming you already have an App.tsx file
require("./index.css"); // Import the CSS file
const rootElement = document.getElementById("root");
const root = client_1.default.createRoot(rootElement);
root.render((0, jsx_runtime_1.jsx)(App_1.default, {}));
