import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  ClientIdType
} from '@/types/WebSocketProtocol';

interface ActiveUsersState {
  users: Record<ClientIdType, string>; // client_id -> username
}

const initialState: ActiveUsersState = { users: {} };

export const activeUsersSlice = createSlice({
  name: 'activeUsers',
  initialState,
  reducers: {
    setActiveUsers: (state, action: PayloadAction<Record<ClientIdType, string>>) => {
      state.users = action.payload;
    },
    addActiveUsers: (state, action: PayloadAction<{ userId: ClientIdType; username: string }>) => {
      state.users[action.payload.userId] = action.payload.username;
      console.log("active user ", action.payload.username, " added. Current state: ", state); // debug
    },
    removeActiveUser: (state, action: PayloadAction<ClientIdType>) => {
      delete state.users[action.payload];
    },
  },
});

export const { setActiveUsers, addActiveUsers, removeActiveUser } = activeUsersSlice.actions;
export default activeUsersSlice.reducer;
