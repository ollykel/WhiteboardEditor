import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import type {
  WhiteboardIdType,
  CanvasIdType,
} from '@/types/WebSocketProtocol';

const canvasesByWhiteboardSlice = createSlice({
  name: 'canvasesByWhiteboard',
  initialState: {} as Record<WhiteboardIdType, CanvasIdType[]>,
  reducers: {
    setCanvasesByWhiteboard(state, action: PayloadAction<Record<WhiteboardIdType, CanvasIdType[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addCanvasesByWhiteboard(state, action: PayloadAction<Record<WhiteboardIdType, CanvasIdType[]>>) {
      const out = { ...state };

      Object.entries(action.payload).forEach(([whiteboardId, records]) => {
        if (whiteboardId in state) {
          const canvasIdSet : Record<CanvasIdType, CanvasIdType> = {};

          // add existing whiteboardIds to set
          state[whiteboardId]?.forEach(canvasId => {
            canvasIdSet[canvasId] = canvasId;
          });

          // add new whiteboardIds to set
          records.forEach(canvasId => {
            canvasIdSet[canvasId] = canvasId;
          });

          out[whiteboardId] = Object.values(canvasIdSet);
        } else {
          out[whiteboardId] = [...records];
        }
      });

      return out;
    },
    removeCanvasesByWhiteboard(state, action: PayloadAction<CanvasIdType[]>) {
      for (const [whiteboardId, canvasId] of action.payload) {
        state[whiteboardId] = (state[whiteboardId] ?? []).filter(
          ([wbId, cId]) => !(wbId === whiteboardId && cId === canvasId)
        );
      }
    },
  },
  selectors: {
    // Entire state is mapping of object ids to objects
    // Canvases redundantly store their ids
    selectCanvasesByWhiteboard: (state, canvasId: WhiteboardIdType) => state[canvasId]
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
