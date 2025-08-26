import { createContext } from 'react';

import type { User, UserContextType } from './types/UserAuth';

const AuthContext = createContext<UserContextType | undefined>(undefined);

