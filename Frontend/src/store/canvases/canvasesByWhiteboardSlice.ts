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
  initialState: {} as Record<string, CanvasKeyType[]>,
  reducers: {
    setCanvasesByWhiteboard(state, action: PayloadAction<Record<string, CanvasKeyType[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addCanvasesByWhiteboard(state, action: PayloadAction<Record<string, CanvasKeyType[]>>) {
      const out = { ...state };

      Object.entries(action.payload).forEach(([key, records]) => {
        if (key.toString() in state) {
          const canvasKeySet : Record<string, CanvasKeyType> = {};

          // add existing keys to set
          state[key.toString()]?.forEach(canvasKey => {
            canvasKeySet[canvasKey.toString()] = canvasKey;
          });

          // add new keys to set
          records.forEach(canvasKey => {
            canvasKeySet[canvasKey.toString()] = canvasKey;
          });

          out[key.toString()] = Object.values(canvasKeySet);
        } else {
          out[key.toString()] = [...records];
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
