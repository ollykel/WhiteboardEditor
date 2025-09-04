import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  CanvasKeyType,
  CanvasRecord
} from '@/types/WebSocketProtocol';

const canvasesSlice = createSlice({
  name: 'canvases',
  initialState: {} as Record<string, CanvasRecord>,
  reducers: {
    setCanvases(state, action: PayloadAction<CanvasRecord[]>) {
      return {
        ...state,
        // Store [object_id, object] pairs, then turn them into an object to
        // append to the existing state.
        ...Object.fromEntries(action.payload.map((record) => [
          [record.whiteboardId, record.id].toString(),
          record
        ]))
      };
    },
    removeCanvases(state, action: PayloadAction<CanvasKeyType[]>) {
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
    selectCanvases: (state) => Object.values(state)
  }
});

export const {
  setCanvases,
  removeCanvases
} = canvasesSlice.actions;

export const {
  selectCanvases
} = canvasesSlice.selectors;

export default canvasesSlice.reducer;
