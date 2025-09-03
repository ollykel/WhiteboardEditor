import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  ClientIdType
} from '@/types/WebSocketProtocol';

const allowedUsersSlice = createSlice({
  name: 'allowedUsers',
  // Will store data in a <whiteboard_id, canvas_id, object_id> => CanvasObjectRecord format
  initialState: {} as Record<ClientIdType, ClientIdType>,
  reducers: {
    setAllowedUsers(state, action: PayloadAction<ClientIdType[]>) {

      return {
        ...state,
        ...Object.fromEntries(action.payload.map(clientId => [clientId, clientId]))
      };
    },
    removeAllowedUsers(state, action: PayloadAction<ClientIdType[]>) {
      const out = { ...state };

      for (const id of action.payload) {
        delete out[id];
      }

      return out;
    }
  },
  selectors: {
    // Entire state is mapping of object ids to objects
    // Objects redundantly store their ids
    selectAllowedUsers: (state) => Object.values(state)
  }
});

export const {
  setAllowedUsers,
  removeAllowedUsers
} = allowedUsersSlice.actions;

export const {
  selectAllowedUsers
} = allowedUsersSlice.selectors;

export default allowedUsersSlice.reducer;
