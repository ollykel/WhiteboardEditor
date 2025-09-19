
import type {
  WhiteboardIdType,
  CanvasKeyType,
  CanvasAttribs,
  CanvasData
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectKeyType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

export interface CanvasNormal {
  canvases: Record<string, CanvasAttribs>;
  canvasObjects: Record<string, CanvasObjectModel>;
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
  const { id: canvasId } = canvas;
  const canvasAttribs: Partial<CanvasData> = { ...canvas };
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];
  const canvasObjects = Object.fromEntries(Object.entries(canvas.shapes).map(([objId, obj]) => {
    const objKey: CanvasObjectKeyType = [whiteboardId, canvasId, objId];

    return [objKey.toString(), obj];
  }));

  // remove vector fields from canvasAttribs
  delete canvasAttribs.shapes;
  delete canvasAttribs.allowedUsers;

  return ({
    canvases: ({
      [canvasKey.toString()]: canvasAttribs as CanvasAttribs
    }),
    canvasObjects,
    canvasObjectsByCanvas: {
      [canvasKey.toString()]: Object.keys(canvas.shapes).map((objId) => {
        const objKey: CanvasObjectKeyType = [whiteboardId, canvasId, objId];

        return objKey;
      })
    }
  });
};
