import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  WhiteboardIdType
} from '@/types/WebSocketProtocol';

const canvasesByWhiteboardSlice = createSlice({
  name: 'canvasesByWhiteboard',
  // Will store data in a <whiteboard_id> => CanvasKeyType[] format
  initialState: {} as Record<string, string[]>,
  reducers: {
    setCanvasesByWhiteboard(state, action: PayloadAction<Record<string, string[]>>) {

      return {
        ...state,
        ...action.payload
      };
    },
    removeCanvasesByWhiteboard(state, action: PayloadAction<WhiteboardIdType[]>) {
      const out = { ...state };

      for (const id of action.payload) {
        delete out[id.toString()];
      }

      return out;
    }
  },
  selectors: {
    // Entire state is mapping of object ids to objects
    // Canvases redundantly store their ids
    selectCanvasesByWhiteboard: (state, canvasId: WhiteboardIdType) => state[canvasId.toString()]
  }
});

export const {
  setCanvasesByWhiteboard,
  removeCanvasesByWhiteboard
} = canvasesByWhiteboardSlice.actions;

export const {
  selectCanvasesByWhiteboard
} = canvasesByWhiteboardSlice.selectors;

export default canvasesByWhiteboardSlice.reducer;
