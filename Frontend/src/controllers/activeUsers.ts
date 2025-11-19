import {
  type AppDispatch,
} from '@/store';

import {
  type UserSummary,
  type WhiteboardIdType,
} from "@/types/WebSocketProtocol";

import { 
  addActiveUser as addActiveUserReducer,
  setActiveUsers as setActiveUsersReducer,
} from "@/store/activeUsers/activeUsersSlice";

import {
  addActiveUsersByWhiteboard as addActiveUsersByWhiteboardReducer,
  setActiveUsersByWhiteboard as setActiveUsersByWhiteboardReducer,
} from '@/store/activeUsers/activeUsersByWhiteboardSlice';

export const addActiveUsersByWhiteboard = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  users: UserSummary[],
) => {
  users.forEach((u) => {
    console.log('Processing user:', u);
    dispatch(addActiveUserReducer(u));
  });

  dispatch(addActiveUsersByWhiteboardReducer({
    [whiteboardId]: users.map(u => u.clientId),
  }));
};

export const setActiveUsersByWhiteboard = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  users: UserSummary[],
) => {
  dispatch(setActiveUsersReducer(users));
  dispatch(setActiveUsersByWhiteboardReducer({
    [whiteboardId]: users.map(u => u.clientId),
  }));
};

