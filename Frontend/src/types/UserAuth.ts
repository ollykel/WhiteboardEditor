import type {
  Dispatch
} from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: Dispatch<User | null>;
  authToken: string | null;
  setAuthToken: Dispatch<string | null>;
}
