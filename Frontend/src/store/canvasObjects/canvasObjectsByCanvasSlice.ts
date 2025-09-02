import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  CanvasKeyType
} from '@/types/WebSocketProtocol';

const canvasObjectsByCanvasSlice = createSlice({
  name: 'canvasObjectsByCanvas',
  // Will store data in a <whiteboard_id, canvas_id, object_id> => CanvasObjectRecord format
  initialState: {} as Record<string, string[]>,
  reducers: {
    setObjectsByCanvas(state, action: PayloadAction<Record<string, string[]>>) {

      return {
        ...state,
        ...action.payload
      };
    },
    removeObjectsByCanvas(state, action: PayloadAction<CanvasKeyType[]>) {
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
    selectObjectsByCanvas: (state, canvasId: CanvasKeyType) => state[canvasId.toString()]
  }
});

export const {
  setObjectsByCanvas,
  removeObjectsByCanvas
} = canvasObjectsByCanvasSlice.actions;

export const {
  selectObjectsByCanvas
} = canvasObjectsByCanvasSlice.selectors;

export default canvasObjectsByCanvasSlice.reducer;
