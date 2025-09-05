import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  CanvasKeyType
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectKeyType
} from '@/types/CanvasObjectModel';

// In reality, the string represents a CanvasKeyType
export type CanvasObjectsByCanvasState = Record<string, CanvasObjectKeyType[]>;

const canvasObjectsByCanvasSlice = createSlice({
  name: 'canvasObjectsByCanvas',
  // Will store data in a <whiteboard_id, canvas_id, object_id> => CanvasObjectModel[] format
  initialState: {} as CanvasObjectsByCanvasState,
  reducers: {
    setObjectsByCanvas(state, action: PayloadAction<Record<string, CanvasObjectKeyType[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addObjectsByCanvas(state, action: PayloadAction<Record<string, CanvasObjectKeyType[]>>) {
      const out = { ...state };

      Object.entries(action.payload).forEach(([key, records]) => {
        if (key.toString() in state) {
          const objectKeySet : Record<string, CanvasObjectKeyType> = {};

          // add existing keys to set
          state[key.toString()]?.forEach(objKey => {
            objectKeySet[objKey.toString()] = objKey;
          });

          // add new keys to set
          records.forEach(objKey => {
            objectKeySet[objKey.toString()] = objKey;
          });

          out[key] = Object.values(objectKeySet);
        } else {
          out[key] = [...records];
        }
      });

      return out;
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
  addObjectsByCanvas,
  removeObjectsByCanvas
} = canvasObjectsByCanvasSlice.actions;

export const {
  selectObjectsByCanvas
} = canvasObjectsByCanvasSlice.selectors;

export default canvasObjectsByCanvasSlice.reducer;
