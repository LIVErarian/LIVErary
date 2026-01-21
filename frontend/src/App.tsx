import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GamePage } from './pages/GamePage';
import { UiTestPage } from './pages/UiTestPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UiTestPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
