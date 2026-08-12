import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute({ children }: {children: React.ReactElement;}) {
  const { user, initializing } = useAuth();

  if (initializing) return null;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/services" replace />;

  return children;
}
