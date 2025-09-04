import type {
  AppDispatch
} from '@/store';

import type {
  WhiteboardIdType,
  CanvasIdType,
  CanvasKeyType
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectRecord,
  CanvasObjectRecordFull
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
  canvasObjects: CanvasObjectRecord[]
) => {
  const canvasObjectRecords: CanvasObjectRecordFull[] = canvasObjects.map((canvasObject) => ({
    ...canvasObject,
    canvasId,
    whiteboardId
  }));
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];

  dispatch(setCanvasObjects(canvasObjectRecords));
  dispatch(addObjectsByCanvas({
    [canvasKey.toString()]: canvasObjects.map(obj => [whiteboardId, canvasId, obj.id])
  }));
};
