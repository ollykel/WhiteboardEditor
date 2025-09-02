import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  CanvasObjectRecord,
  CanvasObjectKeyType
} from '@/types/CanvasObjectModel';

const canvasObjectsSlice = createSlice({
  name: 'canvasObjects',
  // Will store data in a <whiteboard_id, canvas_id, object_id> => CanvasObjectRecord format
  initialState: {} as Record<string, CanvasObjectRecord>,
  reducers: {
    setCanvasObjects(state, action: PayloadAction<CanvasObjectRecord[]>) {

      return {
        ...state,
        // Store [object_id, object] pairs, then turn them into an object to
        // append to the existing state.
        ...Object.fromEntries(action.payload.map((record) => [
          // unique id
          [record.whiteboardId, record.canvasId, record.id].toString(),
          record
        ]))
      };
    },
    removeCanvasObjects(state, action: PayloadAction<CanvasObjectKeyType[]>) {
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
    selectCanvasObjects: (state) => Object.values(state)
  }
});

export const {
  setCanvasObjects,
  removeCanvasObjects
} = canvasObjectsSlice.actions;

export const {
  selectCanvasObjects
} = canvasObjectsSlice.selectors;

export default canvasObjectsSlice.reducer;
