import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: {children: React.ReactElement;}) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
}
