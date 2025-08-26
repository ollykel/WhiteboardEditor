type User = {
  id: string;
  username: string;
  email: string;
} | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
}

export type { User, UserContextType };