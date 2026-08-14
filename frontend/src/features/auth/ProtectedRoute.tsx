import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

export function ProtectedRoute({ children }: {children: ReactElement;}) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
