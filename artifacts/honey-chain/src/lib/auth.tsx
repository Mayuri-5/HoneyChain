import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

const REGISTERED_USER_KEY = 'honey-chain.registered-user';
const SESSION_KEY = 'honey-chain.session';

export type AuthUser = {
  name: string;
  email: string;
  phone: string;
  location: string;
};

type StoredUser = AuthUser & {
  password: string;
};

type RegistrationInput = StoredUser;

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (input: RegistrationInput) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredValue<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getSessionUser(): AuthUser | null {
  return readStoredValue<AuthUser>(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSessionUser());

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login: (email, password) => {
      const registeredUser = readStoredValue<StoredUser>(REGISTERED_USER_KEY);
      if (!registeredUser || registeredUser.email.toLowerCase() !== email.trim().toLowerCase() || registeredUser.password !== password) {
        return { ok: false, error: 'Those details did not match a registered beekeeper.' };
      }

      const sessionUser: AuthUser = {
        name: registeredUser.name,
        email: registeredUser.email,
        phone: registeredUser.phone,
        location: registeredUser.location,
      };
      writeStoredValue(SESSION_KEY, sessionUser);
      setUser(sessionUser);
      return { ok: true };
    },
    register: (input) => {
      const existingUser = readStoredValue<StoredUser>(REGISTERED_USER_KEY);
      if (existingUser?.email.toLowerCase() === input.email.trim().toLowerCase()) {
        return { ok: false, error: 'That email is already registered. Sign in instead.' };
      }
      writeStoredValue(REGISTERED_USER_KEY, {
        ...input,
        email: input.email.trim(),
        name: input.name.trim(),
        phone: input.phone.trim(),
        location: input.location.trim(),
      });
      window.localStorage.removeItem(SESSION_KEY);
      setUser(null);
      return { ok: true };
    },
    logout: () => {
      window.localStorage.removeItem(SESSION_KEY);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}