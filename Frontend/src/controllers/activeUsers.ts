import type {
  AppDispatch
} from '@/store';

import type {
  UserSummary,
} from "@/types/WebSocketProtocol";

import { 
  addActiveUser as addActiveUserReducer,
  setActiveUsers
} from "@/store/activeUsers/activeUsersSlice";

export const addActiveUser = (
  dispatch: AppDispatch,
  users: UserSummary[]
) => {
  users.forEach((u) => {
    console.log('Processing user:', u);
    dispatch(addActiveUserReducer(u));
  });
};

export const setActiveUser = (
  dispatch: AppDispatch,
  users: UserSummary[],
) => {
  dispatch(setActiveUsers(users));
}
