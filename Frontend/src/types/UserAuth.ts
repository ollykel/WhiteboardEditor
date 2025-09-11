type User = {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
}

export type { User, AuthContextType };
