import { configureStore } from '@reduxjs/toolkit'

import canvasObjectsReducer from './canvasObjects/canvasObjectsSlice';
import allowedUsersByCanvasReducer from './allowedUsers/allowedUsersByCanvasSlice';
import canvasObjectsByCanvasReducer from './canvasObjects/canvasObjectsByCanvasSlice';
import canvasesReducer from './canvases/canvasesSlice';
import canvasesByWhiteboardReducer from './canvases/canvasesByWhiteboardSlice';
import whiteboardsReducer from './whiteboards/whiteboardsSlice';

export const store = configureStore({
  reducer: {
    canvasObjects: canvasObjectsReducer,
    canvasObjectsByCanvas: canvasObjectsByCanvasReducer,
    allowedUsersByCanvas: allowedUsersByCanvasReducer,
    canvases: canvasesReducer,
    canvasesByWhiteboard: canvasesByWhiteboardReducer,
    whiteboards: whiteboardsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
