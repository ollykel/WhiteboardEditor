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

import type {
  CanvasObjectRecord,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

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
    ?.map((canvasKey: string) => {
      const canvas = state.canvases[canvasKey];
      const { id, width, height } = canvas;

      if (! canvas) {
        return null;
      } else {
        return ({
          id, width, height,
          shapes: Object.fromEntries(state.canvasObjectsByCanvas[canvasKey.toString()]
            .map(canvasObjectKey => {
              if (! (canvasObjectKey in state.canvasObjects)) {
                return null;
              } else {
                const canvasObjectRecord = state.canvasObjects[canvasObjectKey];
                const { id } = canvasObjectRecord;
                const out: Partial<CanvasObjectRecord> = { ...canvasObjectRecord };

                delete out.id;

                return [id, out as CanvasObjectModel];
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
