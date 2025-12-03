// -- local imports
import {
  type AppDispatch,
} from '@/store';

import {
  type UserSummary,
  type ClientIdType,
  type WhiteboardIdType,
} from "@/types/WebSocketProtocol";

import {
  setActiveUsers,
} from '@/store/activeUsers/activeUsersSlice';

import {
  addActiveUsersByWhiteboard as addActiveUsersByWhiteboardReducer,
  setActiveUsersByWhiteboard as setActiveUsersByWhiteboardReducer,
  removeActiveUsers as removeActiveUsersReducer,
} from '@/store/activeUsers/activeUsersByWhiteboardSlice';

export const addActiveUsersByWhiteboard = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  userSummaries: UserSummary[],
) => {
  dispatch(setActiveUsers(userSummaries));
  dispatch(addActiveUsersByWhiteboardReducer({
    [whiteboardId]: userSummaries.map(userSummary => userSummary.clientId),
  }));
};

export const setActiveUsersByWhiteboard = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  userSummaries: UserSummary[],
) => {
  dispatch(setActiveUsers(userSummaries));
  dispatch(setActiveUsersByWhiteboardReducer({
    [whiteboardId]: userSummaries.map(userSummary => userSummary.clientId)
  }));
};

export const removeActiveUsers = (
  dispatch: AppDispatch,
  userClientIds: ClientIdType[]
) => {
  dispatch(removeActiveUsersReducer(userClientIds));
};
