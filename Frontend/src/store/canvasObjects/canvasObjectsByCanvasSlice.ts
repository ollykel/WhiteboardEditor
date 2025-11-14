import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  CanvasIdType
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectIdType
} from '@/types/CanvasObjectModel';

export type CanvasObjectsByCanvasState = Record<CanvasIdType, CanvasObjectIdType[]>;

const canvasObjectsByCanvasSlice = createSlice({
  name: 'canvasObjectsByCanvas',
  initialState: {} as CanvasObjectsByCanvasState,
  reducers: {
    setObjectsByCanvas(state, action: PayloadAction<Record<CanvasIdType, CanvasObjectIdType[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addObjectsByCanvas(state, action: PayloadAction<Record<CanvasIdType, CanvasObjectIdType[]>>) {
      const out = { ...state };

      Object.entries(action.payload).forEach(([canvasId, records]) => {
        if (canvasId in state) {
          const objectIdSet : Record<CanvasObjectIdType, CanvasObjectIdType> = {};

          // add existing canvasIds to set
          state[canvasId]?.forEach(objId => {
            objectIdSet[objId] = objId;
          });

          // add new canvasIds to set
          records.forEach(objId => {
            objectIdSet[objId] = objId;
          });

          out[canvasId] = Object.values(objectIdSet);
        } else {
          out[canvasId] = [...records];
        }
      });

      return out;
    },
    removeObjectsByCanvas(state, action: PayloadAction<CanvasIdType[]>) {
      const out = { ...state };

      for (const id of action.payload) {
        delete out[id];
      }

      return out;
    }
  },
  selectors: {
    // Entire state is mapping of object ids to objects
    // Objects redundantly store their ids
    selectObjectsByCanvas: (state, canvasId: CanvasIdType) => state[canvasId]
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
