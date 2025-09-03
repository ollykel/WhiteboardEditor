import { createSelector } from '@reduxjs/toolkit';

import type {
  RootState
} from '@/store';

import type {
  CanvasKeyType
} from '@/types/WebSocketProtocol';

import type {
  CanvasRecord,
  WhiteboardIdType
} from '@/types/WebSocketProtocol';

export const selectCanvasById = (state: RootState, canvasId: CanvasKeyType): CanvasRecord | null => (
  state.canvases[canvasId.toString()] || null
);

export const selectCanvasesByWhiteboardId = (state: RootState, whiteboardId: WhiteboardIdType): CanvasRecord[] => (
  state.canvasesByWhiteboard[whiteboardId]?.map(canvasKey => state.canvases[canvasKey.toString()]) ?? []
);

export const selectObjectsForCanvas = (state: RootState, canvasId: CanvasKeyType) => (
  state.canvasObjectsByCanvas[canvasId.toString()]?.map(id => state.canvasObjects[id.toString()]) ?? []
);

export const selectCanvasWithObjects = createSelector(
  [selectCanvasById, selectObjectsForCanvas],
  (canvas, objects) => canvas ? ({ ...canvas, shapes: objects }) : null
);

