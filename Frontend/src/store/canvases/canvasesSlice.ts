import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  CanvasKeyType,
  CanvasAttribs
} from '@/types/WebSocketProtocol';

const canvasesSlice = createSlice({
  name: 'canvases',
  initialState: {} as Record<string, CanvasAttribs>,
  reducers: {
    setCanvases(state, action: PayloadAction<Record<string, CanvasAttribs>>) {
      return ({
        ...state,
        ...action.payload
      });
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
