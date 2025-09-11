import type {
  AppDispatch
} from '@/store';

import type {
  ClientIdType,
  UserSummary,
} from "@/types/WebSocketProtocol";

import { 
  setActiveUsers 
} from "@/store/activeUsers/activeUsersSlice";

export const addActiveUser = (
  dispatch: AppDispatch,
  users: UserSummary[]
) => {
  const usersById: Record<ClientIdType, string> = {};
  users.forEach((u) => {
    console.log('Processing user:', u);
    usersById[u.user_id as unknown as ClientIdType] = u.username;
  });
  console.log("usersById: ", usersById);

  dispatch(setActiveUsers(usersById));
};