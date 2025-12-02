// === activeUsersSlice ========================================================
//
// Stores user summaries indexed by client IDs.
//
// =============================================================================

// -- std imports
import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

// -- local imports
import {
  type ClientIdType,
  type UserSummary,
} from '@/types/WebSocketProtocol';

type ActiveUsersSliceState = Record<ClientIdType, UserSummary>;

const activeUsersSlice = createSlice({
  name: 'activeUsers',
  initialState: {} as ActiveUsersSliceState,
  reducers: {
    setActiveUsers(state, action: PayloadAction<ActiveUsersSliceState>) {
      return {
        ...state,
        ...action.payload
      };
    },
    removeActiveUsers(state, action: PayloadAction<ClientIdType[]>) {
      const newState = { ...state };
      const clientIds : ClientIdType[] = action.payload;

      for (const clientId of clientIds) {
        delete newState[clientId];
      }// -- end for clientId

      return newState;
    },
  },
});// -- end activeUsersSlice

export const {
  setActiveUsers,
  removeActiveUsers,
} = activeUsersSlice.actions;

export default activeUsersSlice.reducer;
