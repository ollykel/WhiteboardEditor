// === childCanvasesByCanvasSlice.ts ===========================================
//
// Maps each canvas to its immediate children.
//
// =============================================================================

import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import {
  type CanvasKeyType
} from '@/types/WebSocketProtocol';

const childCanvasesByCanvasSlice = createSlice({
  name: 'childCanvasesByCanvasSlice',
  // Will store data in a <canvas_key> => CanvasKeyType[] format
  initialState: {} as Record<string, CanvasKeyType[]>,
  reducers: {
    setChildCanvasesByCanvas(state, action: PayloadAction<Record<string, CanvasKeyType[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addChildCanvasesByCanvas(state, action: PayloadAction<Record<string, CanvasKeyType[]>>) {
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
    removeCanvases(state, action: PayloadAction<CanvasKeyType[]>) {
      const canvasIdSet = Object.fromEntries(action.payload.map(key => [
        key.toString(), true
      ]));

      return Object.fromEntries(Object.entries(state).filter(([key, _]) => key in canvasIdSet));
    },
  },
  selectors: {
    // Entire state is mapping of object ids to objects
    // Canvases redundantly store their ids
    selectChildCanvasesByCanvas: (state, canvasKey: CanvasKeyType) => state[canvasKey.toString()]
  }
});

export const {
  setChildCanvasesByCanvas,
  addChildCanvasesByCanvas,
  removeCanvases,
} = childCanvasesByCanvasSlice.actions;

export const {
  selectChildCanvasesByCanvas,
} = childCanvasesByCanvasSlice.selectors;

export default childCanvasesByCanvasSlice.reducer;
