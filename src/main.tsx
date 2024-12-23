import ReactDOM from "react-dom/client";
import App from "./App"; // Assuming you already have an App.tsx file
import "./index.css"; // Import the CSS file

const rootElement = document.getElementById("root") as HTMLElement;

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
