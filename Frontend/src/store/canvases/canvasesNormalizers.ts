
import type {
  WhiteboardIdType,
  CanvasData,
  CanvasRecord
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectKeyType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

export interface CanvasNormal {
  canvases: CanvasRecord[];
  canvasObjects: CanvasObjectModel[];
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

  return ({
    canvases: [({ id, whiteboardId, width, height })],
    canvasObjects: canvas.shapes,
    canvasObjectsByCanvas: {
      [id.toString()]: canvas.shapes.map((sh) => [whiteboardId, id, sh.id])
    }
  });
};
