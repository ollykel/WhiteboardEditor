import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  ClientIdType,
  UserSummary,
} from '@/types/WebSocketProtocol';

interface ActiveUsersState {
  users: Record<ClientIdType, UserSummary>; // client_id -> username
}

const initialState: ActiveUsersState = { users: {} };

export const activeUsersSlice = createSlice({
  name: 'activeUsers',
  initialState,
  reducers: {
    setActiveUsers: (state, action: PayloadAction<UserSummary[]>) => {
      state.users = {};
      action.payload.forEach(userSummary => {
        state.users[userSummary.clientId] = userSummary;
      })
    },
    addActiveUser: (state, action: PayloadAction<UserSummary>) => {
      state.users[action.payload.clientId] = action.payload;
    },
    removeActiveUser: (state, action: PayloadAction<ClientIdType>) => {
      delete state.users[action.payload];
    },
  },
});

export const { setActiveUsers, addActiveUser, removeActiveUser } = activeUsersSlice.actions;
export default activeUsersSlice.reducer;
