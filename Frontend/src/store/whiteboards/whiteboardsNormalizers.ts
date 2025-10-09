import type {
  CanvasData,
  CanvasKeyType,
  WhiteboardIdType,
  WhiteboardData,
  WhiteboardAttribs
} from '@/types/WebSocketProtocol';

import {
  normalizeCanvas,
  type CanvasNormal
} from '@/store/canvases/canvasesNormalizers';

export interface WhiteboardNormal extends CanvasNormal {
  whiteboards: Record<WhiteboardIdType, WhiteboardAttribs>;
  childCanvasesByCanvas: Record<string, CanvasKeyType[]>;
  canvasesByWhiteboard: Record<WhiteboardIdType, CanvasKeyType[]>;
}

// === normalizeWhiteboard =====================================================
//
// Takes a complete canvas object and normalizes it so its constituent parts can
// be stored.
//
// =============================================================================
export const normalizeWhiteboard = (
  whiteboard: WhiteboardData
): WhiteboardNormal => {
  const {
    id,
  } = whiteboard;

  // -- first, generate mapping of canvases to children
  const childCanvasesByCanvas : Record<string, CanvasKeyType[]> = {};

  for (const canvas of whiteboard.canvases) {
    if (canvas.parentCanvas) {
      const childCanvasKey : CanvasKeyType = [id, canvas.id];
      const { canvasId: parentCanvasId } = canvas.parentCanvas;
      const parentCanvasKey : CanvasKeyType = [id, parentCanvasId];

      if (parentCanvasKey.toString() in childCanvasesByCanvas) {
        childCanvasesByCanvas[parentCanvasKey.toString()].push(childCanvasKey);
      } else {
        childCanvasesByCanvas[parentCanvasKey.toString()] = [childCanvasKey];
      }
    }
  }// -- end for (const canvas of whiteboard.canvases)

  const {
    canvases,
    canvasObjects,
    canvasObjectsByCanvas,
    allowedUsersByCanvas,
  } = whiteboard.canvases
    .map((canvas: CanvasData) => normalizeCanvas(id, canvas))
    .reduce(
    (accum: CanvasNormal, curr: CanvasNormal) => ({
      canvases: {...accum.canvases, ...curr.canvases},
      canvasObjects: {...accum.canvasObjects, ...curr.canvasObjects},
      canvasObjectsByCanvas: ({
        ...accum.canvasObjectsByCanvas,
        ...curr.canvasObjectsByCanvas
      }),
      allowedUsersByCanvas: ({
        ...accum.allowedUsersByCanvas,
        ...curr.allowedUsersByCanvas
      }),
    }),
    {
      canvases: {},
      canvasObjects: {},
      canvasObjectsByCanvas: {},
      allowedUsersByCanvas: {},
    }
  );

  return ({
    whiteboards: {
      [id]: whiteboard
    },
    canvases,
    childCanvasesByCanvas,
    canvasesByWhiteboard: {
      [id]: whiteboard.canvases.map(({ id: canvasId }) => {
        const canvasKey: CanvasKeyType = [id, canvasId];

        return canvasKey;
      })
    },
    canvasObjects,
    canvasObjectsByCanvas,
    allowedUsersByCanvas,
  });
};
