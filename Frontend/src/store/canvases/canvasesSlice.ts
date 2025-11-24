import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import {
  type UserIdType,
  type CanvasIdType,
} from '@/types/WebSocketProtocol';

import {
  type CanvasAttribs,
} from '@/types/RootState';

const canvasesSlice = createSlice({
  name: 'canvases',
  initialState: {} as Record<CanvasIdType, CanvasAttribs>,
  reducers: {
    setCanvases(state, action: PayloadAction<Record<CanvasIdType, CanvasAttribs>>) {
      return ({
        ...state,
        ...action.payload
      });
    },
    removeCanvases(state, action: PayloadAction<CanvasIdType[]>) {
      for (const canvasId of action.payload) {
        delete state[canvasId];
      }
    },
    setCurrentEditorByCanvas(state, action: PayloadAction<Record<CanvasIdType, UserIdType>>) {
      const newState : Record<CanvasIdType, CanvasAttribs> = { ...state };

      for (const [canvasId, editorUserId] of Object.entries(action.payload)) {
        if (canvasId in newState) {
          newState[canvasId].currentEditorUserId = editorUserId;
        }
      }// -- end for canvasId, editorUserId

      return newState;
    },
    unsetCurrentEditorByCanvas(state, action: PayloadAction<CanvasIdType[]>) {
      const newState : Record<CanvasIdType, CanvasAttribs> = { ...state };

      for (const canvasId of Object.keys(action.payload)) {
        if (canvasId in newState) {
          delete newState[canvasId].currentEditorUserId;
        }
      }// -- end for canvasId

      return newState;
    },
  },
  selectors: {
    // Entire state is mapping of object ids to objects
    // Objects redundantly store their ids
    selectCanvases: (state) => Object.values(state)
  }
});

export const {
  setCanvases,
  removeCanvases,
  setCurrentEditorByCanvas,
  unsetCurrentEditorByCanvas,
} = canvasesSlice.actions;

export const {
  selectCanvases,
} = canvasesSlice.selectors;

export default canvasesSlice.reducer;
