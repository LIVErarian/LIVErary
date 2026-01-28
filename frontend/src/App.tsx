import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GlobalModal } from './components/modals/GlobalModal';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { GamePage } from './pages/game/GamePage';

function App() {
  return (
    <BrowserRouter>
      <GlobalModal />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
