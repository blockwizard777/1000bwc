import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import your components
import MainMenu from './MainMenu';   // This will be your default screen
import LobbyScreen from './LobbyScreen';
import EditCards from './EditCards';
import CreateDeck from './CreateDeck';
import EditDeck from './EditDeck';
import DeckEditing from './DeckEditing';
import Game from './Game';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default path goes to MainMenu */}
        <Route path="/" element={<MainMenu />} />
        
        {/* Other paths */}
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/edit-cards" element={<EditCards />} />
        <Route path="/create-deck" element={<CreateDeck />} />
        <Route path="/edit-deck" element={<EditDeck />} />
        <Route path="/deck-editing" element={<DeckEditing />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
