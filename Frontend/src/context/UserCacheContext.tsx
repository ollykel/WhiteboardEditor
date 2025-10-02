// === UserCacheContext.tsx ====================================================
// 
// Caches users by 
//
// =============================================================================

// -- std imports
import React, {
  useRef,
  createContext,
  type PropsWithChildren,
} from 'react';

// -- local imports
import {
  type User,
} from '@/types/APIProtocol';

import api from '@/api/axios';

import {
  type AxiosResponse,
} from 'axios';

export interface UserCacheContextType {
  // -- get user identified by id, fetching from ID on cache miss
  getUserById: (userId: string) => Promise<User | null>;

  // -- get user, forcing an API fetch to refresh the user
  fetchUserById: (userId: string) => Promise<User | null>;

  // -- override the value in the cache
  setUserById: (userId: string, user: User) => void;
}

const UserCacheContext = createContext<UserCacheContextType | undefined>(undefined);

export const UserCacheProvider = ({
  children
}: PropsWithChildren<object>): React.JSX.Element => {
  const usersByIdRef = useRef<Record<string, User>>({});

  const getUserById = async (userId: string): Promise<User | null> => {
    if (userId in usersByIdRef.current) {
      return usersByIdRef.current[userId];
    } else {
      const res : AxiosResponse<User> = await api.get(`/users/${userId}`);

      if (res.status >= 400) {
        console.error('Could not fetch user', userId, `- received ${res.status} (${res.statusText})`);
        // no change
        return null;
      } else {
        const user = res.data;

        usersByIdRef.current[userId] = user;

        return user;
      }
    }
  };// end getUserById

  const fetchUserById = async (userId: string): Promise<User | null> => {
    const res : AxiosResponse<User> = await api.get(`/users/${userId}`);

    if (res.status >= 400) {
      console.error('Could not fetch user', userId, `- received ${res.status} (${res.statusText})`);
      // no change
      return null;
    } else {
      const user = res.data;

      usersByIdRef.current[userId] = user;

      return user;
    }
  };// end fetchUserById

  const setUserById = (userId: string, user: User) => {
    usersByIdRef.current[userId] = user;
  };// end fetchUserById

  return (
    <UserCacheContext.Provider value={{
      getUserById,
      fetchUserById,
      setUserById,
    }}>
      {children}
    </UserCacheContext.Provider>
  );
}

export default UserCacheContext;
