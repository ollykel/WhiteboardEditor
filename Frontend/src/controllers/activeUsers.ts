import type {
  AppDispatch
} from '@/store';

import type {
  UserSummary,
} from "@/types/WebSocketProtocol";

import { 
  addActiveUsers
} from "@/store/activeUsers/activeUsersSlice";

export const addActiveUser = (
  dispatch: AppDispatch,
  users: UserSummary[]
) => {
  users.forEach((u) => {
    console.log('Processing user:', u);
    dispatch(addActiveUsers(u));
  });
};
