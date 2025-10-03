import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  ClientIdType,
  UserSummary
} from '@/types/WebSocketProtocol';

interface ActiveUsersState {
  users: Record<ClientIdType, string>; // client_id -> username
}

const initialState: ActiveUsersState = { users: {} };

export const activeUsersSlice = createSlice({
  name: 'activeUsers',
  initialState,
  reducers: {
    setActiveUsers: (state, action: PayloadAction<UserSummary[]>) => {
      state.users = {};
      action.payload.forEach(u => {
        state.users[u.userId] = u.username;
      })
    },
    addActiveUsers: (state, action: PayloadAction<UserSummary>) => {
      state.users[action.payload.userId] = action.payload.username;
    },
    removeActiveUser: (state, action: PayloadAction<ClientIdType>) => {
      delete state.users[action.payload];
    },
  },
});

export const { setActiveUsers, addActiveUsers, removeActiveUser } = activeUsersSlice.actions;
export default activeUsersSlice.reducer;
