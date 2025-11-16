import type {
  CanvasData,
  CanvasIdType,
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
  childCanvasesByCanvas: Record<string, CanvasIdType[]>;
  canvasesByWhiteboard: Record<WhiteboardIdType, CanvasIdType[]>;
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
    id: whiteboardId,
  } = whiteboard;

  // -- first, generate mapping of canvases to children
  const childCanvasesByCanvas : Record<string, CanvasIdType[]> = {};

  for (const canvas of whiteboard.canvases) {
    if (canvas.parentCanvas) {
      const childCanvasId : CanvasIdType = canvas.id;
      const { canvasId: parentCanvasId } = canvas.parentCanvas;

      if (parentCanvasId in childCanvasesByCanvas) {
        childCanvasesByCanvas[parentCanvasId].push(childCanvasId);
      } else {
        childCanvasesByCanvas[parentCanvasId] = [childCanvasId];
      }
    }
  }// -- end for (const canvas of whiteboard.canvases)

  const {
    canvases,
    canvasObjects,
    canvasObjectsByCanvas,
    allowedUsersByCanvas,
  } = whiteboard.canvases
    .map((canvas: CanvasData) => normalizeCanvas(canvas))
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
      [whiteboardId]: whiteboard
    },
    canvases,
    childCanvasesByCanvas,
    canvasesByWhiteboard: {
      [whiteboardId]: whiteboard.canvases.map(({ id }) => id)
    },
    canvasObjects,
    canvasObjectsByCanvas,
    allowedUsersByCanvas,
  });
};
