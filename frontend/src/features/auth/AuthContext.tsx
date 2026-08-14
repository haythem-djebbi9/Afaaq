import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchMe,
  loginUser,
  registerUser,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload
} from '@/features/auth/auth.api';

const STORAGE_KEY = 'afaaq.session';

interface StoredSession {
  token: string;
  user: AuthUser;
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: ReactNode;}) {
  const initial = readStoredSession();
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null);
  const [token, setToken] = useState<string | null>(initial?.token ?? null);
  const [initializing, setInitializing] = useState(!!initial);

  useEffect(() => {
    if (!initial) return;
    fetchMe(initial.token).
    then((freshUser) => {
      setUser(freshUser);
    }).
    catch(() => {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setToken(null);
    }).
    finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((session: StoredSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session.user);
    setToken(session.token);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await loginUser(payload);
    persist({ token: session.accessToken, user: session.user });
    return session.user;
  }, [persist]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await registerUser(payload);
    persist({ token: session.accessToken, user: session.user });
    return session.user;
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, initializing, login, register, logout }),
    [user, token, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
