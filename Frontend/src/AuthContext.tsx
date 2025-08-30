import { useState, createContext, useContext, type ReactNode } from 'react';

import type { User, AuthContextType } from './types/UserAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useUser must be used within an AuthProvider")
  }

  return context;
}