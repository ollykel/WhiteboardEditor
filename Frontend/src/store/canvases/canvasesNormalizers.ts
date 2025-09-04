
import type {
  WhiteboardIdType,
  CanvasKeyType,
  CanvasData,
  CanvasRecord
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectKeyType,
  CanvasObjectRecordFull
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
  const { id, width, height } = canvas;
  const canvasKey: CanvasKeyType = [whiteboardId, id];
  const canvasObjects = canvas.shapes.map(sh => ({
    ...sh, canvasId: id, whiteboardId
  }));

  return ({
    canvases: [({ id, whiteboardId, width, height })],
    canvasObjects,
    canvasObjectsByCanvas: {
      [canvasKey.toString()]: canvasObjects.map((sh) => [whiteboardId, id, sh.id])
    }
  });
};
