import { createSelector } from '@reduxjs/toolkit';

import type {
  RootState
} from '@/store';

import type {
  CanvasRecord,
  CanvasData,
  CanvasKeyType,
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

export const selectCanvasesWithObjectsByWhiteboardId = (state: RootState, whiteboardId: WhiteboardIdType): CanvasData[] => (
  state.canvasesByWhiteboard[whiteboardId]
    ?.map((canvasKey: CanvasKeyType) => {
      const canvas = state.canvases[canvasKey.toString()];
      const { id, width, height } = canvas;

      if (! canvas) {
        return null;
      } else {
        return ({
          id, width, height,
          shapes: state.canvasObjectsByCanvas[canvasKey.toString()]
            ?.map(objectKey => state.canvasObjects[objectKey.toString()]) ?? [],
          allowedUsers: state.allowedUsersByCanvas[canvasKey.toString()] || []
        });
      }
    })
    .filter(canvas => !!canvas)
    ?? []
);
