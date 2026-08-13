import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

export function AdminRoute({ children }: {children: ReactElement;}) {
  const { user, initializing } = useAuth();

  if (initializing) return null;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/services" replace />;

  return children;
}
