
import type {
  WhiteboardIdType,
  CanvasKeyType,
  CanvasData,
  CanvasRecord
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectRecordFull,
  CanvasObjectKeyType
} from '@/types/CanvasObjectModel';

export interface CanvasNormal {
  canvases: CanvasRecord[];
  canvasObjects: CanvasObjectRecordFull[];
  canvasObjectsByCanvas: Record<string, CanvasObjectKeyType[]>;
}

// === normalizeCanvas =========================================================
//
// Takes a complete canvas object and normalizes it so its constituent parts can
// be stored.
//
// =============================================================================
export const normalizeCanvas = (
  whiteboardId: WhiteboardIdType,
  canvas: CanvasData
): CanvasNormal => {
  const { id: canvasId, width, height } = canvas;
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];
  const canvasObjects = Object.entries(canvas.shapes).map(([shapeId, shape]) => ({
    ...shape, id: parseInt(shapeId), canvasId, whiteboardId
  }));

  return ({
    canvases: [({ id: canvasId, whiteboardId, width, height })],
    canvasObjects,
    canvasObjectsByCanvas: {
      [canvasKey.toString()]: canvasObjects.map((sh) => [whiteboardId, canvasId, sh.id])
    }
  });
};
