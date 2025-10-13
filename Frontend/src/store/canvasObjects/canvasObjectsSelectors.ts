import type {
  RootState
} from '@/store';

import type {
  WhiteboardIdType,
  CanvasIdType,
  CanvasKeyType
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectIdType,
  CanvasObjectKeyType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

export const selectCanvasObjectsByCanvas = (
  state: RootState,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType
): Record<CanvasObjectIdType, CanvasObjectModel> | null => {
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];
  const objectsIds: CanvasObjectKeyType[] | null = state.canvasObjectsByCanvas[canvasKey.toString()] || null;

  if (! objectsIds) {
    return null;
  } else {
    return Object.fromEntries(objectsIds.map((objectKey: CanvasObjectKeyType) => {
      const canvasObject = state.canvasObjects[objectKey.toString()] || null;

      if (! canvasObject) {
        return null;
      } else {
        const [_whiteboardId, _canvasId, objectId] = objectKey;

        return [objectId, canvasObject];
      }
    }).filter(entry => !!entry));
  }
};

export const selectCanvasObjectsByWhiteboard = (
  state: RootState,
  whiteboardId: WhiteboardIdType
): Record<CanvasIdType, Record<CanvasObjectIdType, CanvasObjectModel>> => {
  const canvasKeys: CanvasKeyType[] | null = state.canvasesByWhiteboard[whiteboardId] || null;

  if (! canvasKeys) {
    return {};
  } else {
    return Object.fromEntries(canvasKeys.map((canvasKey: CanvasKeyType) => {
      const [_whiteboardId, canvasId] = canvasKey;
      const objectKeys = state.canvasObjectsByCanvas[canvasKey.toString()] || null;

      if (! objectKeys) {
        return null;
      } else {
        return [
          canvasId,
          Object.fromEntries(objectKeys.map(objKey => {
            const [_whiteboardId, _canvasId, objectId] = objKey;
            const objModel = state.canvasObjects[objKey.toString()];

            if (! objModel) {
              return null;
            } else {
              return [objectId, objModel];
            }
          }).filter(entry => !!entry))
        ];
      }
    }).filter(entry => !!entry));
  }
};

export const selectCanvasObjectById = (
  state: RootState,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType,
  objectId: CanvasObjectIdType
): CanvasObjectModel | null => {
  const key: CanvasObjectKeyType = [whiteboardId, canvasId, objectId];
  const canvasObject: CanvasObjectModel | null = state.canvasObjects[key.toString()] || null;

  return canvasObject;
};

export const selectCanvasIdForShape = (
  state: RootState,
  whiteboardId: WhiteboardIdType,
  objectId: CanvasObjectIdType
): CanvasIdType | null => {
  // Iterate through all canvases in the whiteboard
  const canvasKeys = state.canvasesByWhiteboard[whiteboardId] ?? [];

  for (const canvasKey of canvasKeys) {
    const canvasObjectKeys = state.canvasObjectsByCanvas[canvasKey.toString()] ?? [];

    for (const objectKey of canvasObjectKeys) {
      const [_wbId, canvasId, objId] = objectKey;

      if (objId === objectId) {
        return canvasId;
      }
    }
  }

  return null;
};
