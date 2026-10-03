import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { mockAuthService, userSchema, type AuthService, type Credentials, type SignUpData, type User } from './authService';
import { readStored, writeStored } from './storage';

const STORAGE_KEY = 'gc.user';
// The session lasts until the tab is closed, so opening the app again starts at Welcome.
const STORAGE_AREA = 'sessionStorage';

interface AuthContextValue {
  user: User | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, service = mockAuthService }: { children: ReactNode; service?: AuthService }) {
  const [user, setUser] = useState<User | null>(() => readStored(STORAGE_KEY, userSchema.nullable(), null, STORAGE_AREA));

  const keep = useCallback((next: User | null) => {
    setUser(next);
    writeStored(STORAGE_KEY, next, STORAGE_AREA);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: async (credentials) => keep(await service.signIn(credentials)),
      signUp: async (data) => keep(await service.signUp(data)),
      signInDemo: async () => keep(await service.demo()),
      signOut: () => keep(null),
    }),
    [user, service, keep],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
