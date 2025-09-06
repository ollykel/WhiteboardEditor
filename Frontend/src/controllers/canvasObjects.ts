import type {
  AppDispatch
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

import {
  setCanvasObjects
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  addObjectsByCanvas
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

const controllerSetCanvasObjects = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType,
  canvasObjects: Record<CanvasObjectIdType, CanvasObjectModel>
) => {
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];
  const canvasObjectsByKey: Record<string, CanvasObjectModel> = Object.fromEntries(
    Object.entries(canvasObjects).map(([objIdStr, obj]) => {
      const objId = parseInt(objIdStr);
      const objKey: CanvasObjectKeyType = [whiteboardId, canvasId, objId];

      return [objKey, obj];
    })
  );

  dispatch(setCanvasObjects(canvasObjectsByKey));
  dispatch(addObjectsByCanvas({
    [canvasKey.toString()]: Object.keys(canvasObjects).map(id => [whiteboardId, canvasId, parseInt(id)])
  }));
};

export {
  controllerSetCanvasObjects as setCanvasObjects
};
