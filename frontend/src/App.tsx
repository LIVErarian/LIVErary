import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/routes/ProtectedRoute'; // 👈 위에서 만든 파일 경로 import
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
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* 로그인 필수 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<GamePage />} />
        </Route>

        {/* 없는 페이지 처리 (404) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
