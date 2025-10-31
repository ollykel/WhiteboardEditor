import type {
  RootState
} from '@/store';

import {
  type ClientIdType,
  type UserSummary,
} from '@/types/WebSocketProtocol';

export const selectActiveUsers = (state: RootState): Record<ClientIdType, UserSummary> => {
  return state.activeUsers.users;
};

export const selectActiveUserByClientId = (state: RootState, clientId: ClientIdType): UserSummary | null => {
  return state.activeUsers.users[clientId] || null;
};
