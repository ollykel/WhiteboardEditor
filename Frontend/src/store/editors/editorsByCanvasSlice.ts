// -- third-party imports
import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import {
  type UserIdType,
  type CanvasIdType,
} from '@/types/WebSocketProtocol';

const editorsByCanvasSlice = createSlice({
  name: 'editorsByCanvas',
  initialState: {} as Record<CanvasIdType, UserIdType[]>,
  reducers: {
    setEditorsByCanvas(state, action: PayloadAction<Record<CanvasIdType, UserIdType[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addEditorsByCanvas(state, action: PayloadAction<Record<string, string[]>>) {
      const out = { ...state };

      Object.entries(action.payload).forEach(([canvasId, userIds]) => {
        if (canvasId in state) {
          out[canvasId] = [...state[canvasId], ...userIds];
        } else {
          out[canvasId] = userIds;
        }
      });

      return out;
    },
    removeEditorsByCanvas(state, action: PayloadAction<[]>) {
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
    selectEditorsByCanvas: (state, canvasId: CanvasIdType) => state[canvasId]
  }
});

export const {
  setEditorsByCanvas,
  addEditorsByCanvas,
  removeEditorsByCanvas
} = editorsByCanvasSlice.actions;

export const {
  selectEditorsByCanvas
} = editorsByCanvasSlice.selectors;

export default editorsByCanvasSlice.reducer;
