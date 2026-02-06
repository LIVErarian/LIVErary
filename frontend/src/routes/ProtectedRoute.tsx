import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';

export const ProtectedRoute = () => {
  const location = useLocation();

  const accessToken = useAuthStore((state) => state.accessToken);

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 토큰이 있으면 자식 라우트(GamePage 등) 렌더링
  return <Outlet />;
};
