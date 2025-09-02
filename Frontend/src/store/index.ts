import { configureStore } from '@reduxjs/toolkit'

import canvasObjectsReducer from './canvasObjects/canvasObjectsSlice';
import canvasObjectsByCanvasReducer from './canvasObjects/canvasObjectsByCanvasSlice';
import canvasesReducer from './canvases/canvasesSlice';

export const store = configureStore({
  reducer: {
    canvasObjects: canvasObjectsReducer,
    canvasObjectsByCanvas: canvasObjectsByCanvasReducer,
    canvases: canvasesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
