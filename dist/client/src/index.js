"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = __importDefault(require("react-dom/client"));
const App_1 = __importDefault(require("./App")); // Import your main App component
// Find the HTML element with the id 'root' where the React app will be rendered
const rootElement = document.getElementById('root');
// Create a root for React to render the app into
const root = client_1.default.createRoot(rootElement);
// Render the App component inside the root element
root.render((0, jsx_runtime_1.jsx)(App_1.default, {}));
