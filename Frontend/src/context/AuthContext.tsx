import { useState, useEffect, createContext, type ReactNode } from 'react';

import type { User, AuthContextType } from '@/types/UserAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY_USER = 'user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>((): User | null => {
    const val = localStorage.getItem(LS_KEY_USER);

    if (! val) {
      return null;
    } else {
      return JSON.parse(val);
    }
  });

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_KEY_USER, JSON.stringify(user));
    }
    else {
      localStorage.removeItem(LS_KEY_USER);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
