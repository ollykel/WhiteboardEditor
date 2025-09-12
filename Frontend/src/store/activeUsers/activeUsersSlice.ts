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
    addActiveUser: (state, action: PayloadAction<{ clientId: ClientIdType; username: string }>) => {
      state.users[action.payload.clientId] = action.payload.username;
    },
    removeActiveUser: (state, action: PayloadAction<ClientIdType>) => {
      delete state.users[action.payload];
    },
  },
});

export const { setActiveUsers, addActiveUser, removeActiveUser } = activeUsersSlice.actions;
export default activeUsersSlice.reducer;
