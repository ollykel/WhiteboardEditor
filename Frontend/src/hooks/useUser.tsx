import { useContext } from 'react';
import AuthContext from '@/context/AuthContext';
import type { AuthContextType } from '@/types/UserAuth';

export function useUser(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useUser must be used within an AuthProvider")
  }

  return context;
}