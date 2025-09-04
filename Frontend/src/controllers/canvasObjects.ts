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
  CanvasObjectModel,
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
  canvasObjects: Record<CanvasObjectIdType, CanvasObjectModel>
) => {
  const canvasObjectRecords: CanvasObjectRecordFull[] = Object.entries(canvasObjects).map(([id, obj]) => ({
    ...obj,
    id: parseInt(id),
    canvasId,
    whiteboardId
  }));
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];

  dispatch(setCanvasObjects(canvasObjectRecords));
  dispatch(addObjectsByCanvas({
    [canvasKey.toString()]: Object.keys(canvasObjects).map(id => [whiteboardId, canvasId, parseInt(id)])
  }));
};
