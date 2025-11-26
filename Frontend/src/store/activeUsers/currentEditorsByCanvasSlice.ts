// === currentEditorsByCanvasSlice =============================================
//
// Tracks which active user is currently editing each canvas.
//
// This is an optional one-to-one relationship: each canvas has at most one
// current editor, and each client is currently editing at most one canvas. As
// such, two dictionaries must be maintained to ensure the mapping is
// one-to-one.
//
// =============================================================================

// -- std imports
import {
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit'

// -- local imports
import {
  type ClientIdType,
  type CanvasIdType,
} from '@/types/WebSocketProtocol';

// -- type definitions
interface CurrentEditorsByCanvasSliceState {
  currentEditorsByCanvas: Record<CanvasIdType, ClientIdType>;
  canvasesByCurrentEditor: Record<ClientIdType, CanvasIdType>;
}

const currentEditorsByCanvasSlice = createSlice({
  name: 'currentEditorsByCanvas',
  initialState: {
    currentEditorsByCanvas: {},
    canvasesByCurrentEditor: {},
  } as CurrentEditorsByCanvasSliceState,
  reducers: {
    setCurrentEditorsByCanvas(state, action: PayloadAction<Record<CanvasIdType, ClientIdType>>) {
      const newCurrentEditorsByCanvas = { ...state.currentEditorsByCanvas };
      const newCanvasesByCurrentEditor = { ...state.canvasesByCurrentEditor };

      for (const [canvasId, clientId] of Object.entries(action.payload)) {
        // -- ensure no many-to-one mappings of canvases to client ids
        if (clientId in newCanvasesByCurrentEditor) {
          delete newCurrentEditorsByCanvas[newCanvasesByCurrentEditor[clientId]];
        }

        newCurrentEditorsByCanvas[canvasId] = clientId;
        newCanvasesByCurrentEditor[clientId] = canvasId;
      }// -- end for canvasId, clientId

      return {
        currentEditorsByCanvas: newCurrentEditorsByCanvas,
        canvasesByCurrentEditor: newCanvasesByCurrentEditor,
      };
    },
    unsetCurrentEditorsByCanvas(state, action: PayloadAction<CanvasIdType[]>) {
      const newCurrentEditorsByCanvas = { ...state.currentEditorsByCanvas };
      const newCanvasesByCurrentEditor = { ...state.canvasesByCurrentEditor };

      for (const canvasId of action.payload) {
        delete newCanvasesByCurrentEditor[newCurrentEditorsByCanvas[canvasId]];
        delete newCurrentEditorsByCanvas[canvasId];
      }// -- end for canvasId

      return {
        currentEditorsByCanvas: newCurrentEditorsByCanvas,
        canvasesByCurrentEditor: newCanvasesByCurrentEditor,
      };
    },
    removeCurrentEditors(state, action: PayloadAction<ClientIdType[]>) {
      const newCurrentEditorsByCanvas = { ...state.currentEditorsByCanvas };
      const newCanvasesByCurrentEditor = { ...state.canvasesByCurrentEditor };

      for (const clientId of action.payload) {
        delete newCurrentEditorsByCanvas[newCanvasesByCurrentEditor[clientId]];
        delete newCanvasesByCurrentEditor[clientId];
      }// -- end for canvasId

      return {
        currentEditorsByCanvas: newCurrentEditorsByCanvas,
        canvasesByCurrentEditor: newCanvasesByCurrentEditor,
      };
    },
  },
});// -- end currentEditorsByCanvasSlice

export default currentEditorsByCanvasSlice.reducer;
