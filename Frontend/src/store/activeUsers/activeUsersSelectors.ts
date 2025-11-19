import type {
  RootState
} from '@/store';

import {
  type ClientIdType,
  type UserSummary,
  type WhiteboardIdType,
} from '@/types/WebSocketProtocol';

export const selectActiveUsers = (state: RootState): Record<ClientIdType, UserSummary> => {
  return state.activeUsers.users;
};

export const selectActiveUsersByWhiteboard = (state: RootState, wid: WhiteboardIdType) : Record<ClientIdType, UserSummary> => {
  return Object.fromEntries(state.activeUsersByWhiteboard[wid]?.map(
    clientId => [clientId, state.activeUsers.users[clientId]]
  ) ?? []);
};

export const selectActiveUserByClientId = (state: RootState, clientId: ClientIdType): UserSummary | null => {
  return state.activeUsers.users[clientId] || null;
};
