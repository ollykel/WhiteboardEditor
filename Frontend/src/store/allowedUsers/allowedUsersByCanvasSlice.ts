import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  UserSummary,
  CanvasKeyType,
} from '@/types/WebSocketProtocol';

const allowedUsersByCanvasSlice = createSlice({
  name: 'allowedUsersByCanvas',
  // Will store data in a <whiteboard_id, canvas_id> => ClientId[] format
  initialState: {} as Record<string, UserSummary[]>,
  reducers: {
    setAllowedUsersByCanvas(state, action: PayloadAction<Record<string, UserSummary[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addAllowedUsersByCanvas(state, action: PayloadAction<Record<string, UserSummary[]>>) {
      const out = { ...state };

      Object.entries(action.payload).forEach(([id, users]) => {
        if (id.toString() in state) {
          out[id] = [...state[id], ...users];
        } else {
          out[id] = users;
        }
      });

      return out;
    },
    removeAllowedUsersByCanvas(state, action: PayloadAction<CanvasKeyType[]>) {
      const out = { ...state };

      for (const id of action.payload) {
        delete out[id.toString()];
      }

      return out;
    }
  },
  selectors: {
    // Entire state is mapping of object ids to objects
    // Objects redundantly store their ids
    selectAllowedUsersByCanvas: (state, canvasId: CanvasKeyType) => state[canvasId.toString()]
  }
});

export const {
  setAllowedUsersByCanvas,
  addAllowedUsersByCanvas,
  removeAllowedUsersByCanvas
} = allowedUsersByCanvasSlice.actions;

export const {
  selectAllowedUsersByCanvas
} = allowedUsersByCanvasSlice.selectors;

export default allowedUsersByCanvasSlice.reducer;
