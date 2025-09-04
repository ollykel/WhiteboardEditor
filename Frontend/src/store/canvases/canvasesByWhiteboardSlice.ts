import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  WhiteboardIdType,
  CanvasKeyType
} from '@/types/WebSocketProtocol';

const canvasesByWhiteboardSlice = createSlice({
  name: 'canvasesByWhiteboard',
  // Will store data in a <whiteboard_id> => CanvasKeyType[] format
  initialState: {} as Record<string, string[]>,
  reducers: {
    setCanvasesByWhiteboard(state, action: PayloadAction<Record<string, CanvasKeyType[]>>) {

      return {
        ...state,
        ...Object.fromEntries(Object.entries(action.payload).map(([k, v]) => [
          k, v.map(canvasKey => canvasKey.toString())
        ]))
      };
    },
    addCanvasesByWhiteboard(state, action: PayloadAction<Record<string, CanvasKeyType[]>>) {
      const out = { ...state };

      Object.entries(action.payload).forEach(([id, records]) => {
        if (id.toString() in state) {
          // need to filter out duplicate records
          out[id] = [...new Set([...state[id], ...records.map(canvasKey => canvasKey.toString())])];
        } else {
          out[id] = records.map(canvasKey => canvasKey.toString());
        }
      });

      return out;
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
  addCanvasesByWhiteboard,
  removeCanvasesByWhiteboard
} = canvasesByWhiteboardSlice.actions;

export const {
  selectCanvasesByWhiteboard
} = canvasesByWhiteboardSlice.selectors;

export default canvasesByWhiteboardSlice.reducer;
