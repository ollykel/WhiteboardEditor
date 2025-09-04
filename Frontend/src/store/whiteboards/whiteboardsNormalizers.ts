import type {
  CanvasData,
  CanvasKeyType,
  WhiteboardData,
  WhiteboardRecord
} from '@/types/WebSocketProtocol';

import {
  normalizeCanvas,
  type CanvasNormal
} from '@/store/canvases/canvasesNormalizers';

export interface WhiteboardNormal extends CanvasNormal {
  whiteboards: WhiteboardRecord[];
  canvasesByWhiteboard: Record<string, CanvasKeyType[]>;
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
  const { id, name } = whiteboard;

  const {
    canvases,
    canvasObjects,
    canvasObjectsByCanvas
  } = whiteboard.canvases
    .map((canvas: CanvasData) => normalizeCanvas(id, canvas))
    .reduce(
    (accum: CanvasNormal, curr: CanvasNormal) => ({
      canvases: [...accum.canvases, ...curr.canvases],
      canvasObjects: [...accum.canvasObjects, ...curr.canvasObjects],
      canvasObjectsByCanvas: ({
        ...accum.canvasObjectsByCanvas,
        ...curr.canvasObjectsByCanvas
      })
    }),
    {
      canvases: [],
      canvasObjects: [],
      canvasObjectsByCanvas: {}
    }
  );

  return ({
    whiteboards: [({ id, name })],
    canvases,
    canvasesByWhiteboard: {
      [id]: canvases.map(canvas => [id, canvas.id])
    },
    canvasObjects,
    canvasObjectsByCanvas
  });
};
