import { createSelector } from '@reduxjs/toolkit';

import type {
  RootState
} from '@/store';

import type {
  CanvasAttribs,
  CanvasData,
  CanvasKeyType,
  WhiteboardIdType
} from '@/types/WebSocketProtocol';

export const selectCanvasById = (state: RootState, canvasId: CanvasKeyType): CanvasAttribs | null => (
  state.canvases[canvasId.toString()] || null
);

export const selectCanvasesByWhiteboardId = (state: RootState, whiteboardId: WhiteboardIdType): CanvasAttribs[] => (
  state.canvasesByWhiteboard[whiteboardId]?.map(canvasKey => state.canvases[canvasKey.toString()]) ?? []
);

export const selectObjectsForCanvas = (state: RootState, canvasId: CanvasKeyType) => (
  state.canvasObjectsByCanvas[canvasId.toString()]?.map(id => state.canvasObjects[id.toString()]) ?? []
);

export const selectCanvasWithObjects = createSelector(
  [selectCanvasById, selectObjectsForCanvas],
  (canvas, objects) => canvas ? ({ ...canvas, shapes: objects }) : null
);

export const selectCanvasesWithObjectsByWhiteboardId = (
  state: RootState,
  whiteboardId: WhiteboardIdType
): CanvasData[] => (
  state.canvasesByWhiteboard[whiteboardId]
    ?.map((canvasKey: CanvasKeyType) => {
      const canvas = state.canvases[canvasKey.toString()] || null;

      if (! canvas) {
        return null;
      } else {
        const { id, width, height } = canvas;

        return ({
          id, width, height,
          shapes: Object.fromEntries(state.canvasObjectsByCanvas[canvasKey.toString()]
            .map(canvasObjectKey => {
              if (! (canvasObjectKey.toString() in state.canvasObjects)) {
                return null;
              } else {
                const [_whiteboardId, _canvasId, objId] = canvasObjectKey;
                const canvasObjectRecord = state.canvasObjects[canvasObjectKey.toString()];

                return [objId, canvasObjectRecord];
              }
            })
            .filter(entry => !!entry)
          ),
          allowedUsers: state.allowedUsersByCanvas[canvasKey.toString()] || []
        });
      }
    })
    .filter(canvas => !!canvas)
    ?? []
);
