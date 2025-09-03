import type {
  AppDispatch
} from '@/store';

import type {
  WhiteboardIdType,
  CanvasIdType
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectModel,
  CanvasObjectRecord
} from '@/types/CanvasObjectModel';

import {
  setCanvasObjects
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  addObjectsByCanvas
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

export const addCanvasObjects = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType,
  canvasObjects: CanvasObjectModel[]
) => {
  const canvasObjectRecords: CanvasObjectRecord[] = canvasObjects.map((canvasObject) => ({
    ...canvasObject,
    canvasId,
    whiteboardId
  }));

  dispatch(setCanvasObjects(canvasObjectRecords));
  dispatch(addObjectsByCanvas({
    [canvasId]: canvasObjects.map(obj => [whiteboardId, canvasId, obj.id])
  }));
};
