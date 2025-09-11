import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ActiveUsersState {
  users: Record<number, string>; // client_id -> username
}

const initialState: ActiveUsersState = { users: {} };

export const activeUsersSlice = createSlice({
  name: 'activeUsers',
  initialState,
  reducers: {
    setActiveUsers: (state, action: PayloadAction<Record<number, string>>) => {
      state.users = action.payload;
    },
    addActiveUser: (state, action: PayloadAction<{ clientId: number; username: string }>) => {
      state.users[action.payload.clientId] = action.payload.username;
    },
    removeActiveUser: (state, action: PayloadAction<number>) => {
      delete state.users[action.payload];
    },
  },
});

export const { setActiveUsers, addActiveUser, removeActiveUser } = activeUsersSlice.actions;
export default activeUsersSlice.reducer;