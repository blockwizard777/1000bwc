import ReactDOM from 'react-dom/client';
import App from './App';  // Import your main App component

// Find the HTML element with the id 'root' where the React app will be rendered
const rootElement = document.getElementById('root') as HTMLElement;

// Create a root for React to render the app into
const root = ReactDOM.createRoot(rootElement);

// Render the App component inside the root element
root.render(<App />);
