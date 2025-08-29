type User = {
  _id: string;
  username: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
}

export type { User, AuthContextType };