import { useState, useEffect, createContext, type ReactNode } from 'react';

import type { User, AuthContextType } from '@/types/UserAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY_USER = 'user';
const LS_KEY_AUTH_TOKEN = 'token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>((): User | null => {
    const val = localStorage.getItem(LS_KEY_USER);

    if (! val) {
      return null;
    } else {
      return JSON.parse(val);
    }
  });

  // -- store auth token (jwt) here, as a mirror/interface to localStorage
  const [authToken, setAuthToken] = useState<string | null>(
    (): string | null => localStorage.getItem(LS_KEY_AUTH_TOKEN) || null
  );

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_KEY_USER);
    }
  }, [user]);

  // Save authToken to localStorage whenever authToken changes
  useEffect(() => {
    if (authToken) {
      localStorage.setItem(LS_KEY_AUTH_TOKEN, authToken);
    } else {
      localStorage.removeItem(LS_KEY_AUTH_TOKEN);
    }
  }, [authToken]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      authToken,
      setAuthToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
