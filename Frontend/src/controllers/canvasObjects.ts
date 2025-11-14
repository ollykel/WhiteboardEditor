import type {
  AppDispatch,
} from '@/store';

import type {
  CanvasIdType,
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectIdType,
  CanvasObjectModel,
} from '@/types/CanvasObjectModel';

import {
  setCanvasObjects,
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  addObjectsByCanvas,
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

const controllerSetCanvasObjects = (
  dispatch: AppDispatch,
  canvasId: CanvasIdType,
  canvasObjects: Record<CanvasObjectIdType, CanvasObjectModel>
) => {
  dispatch(setCanvasObjects(canvasObjects));
  dispatch(addObjectsByCanvas({
    [canvasId]: Object.keys(canvasObjects)
  }));
};

export {
  controllerSetCanvasObjects as setCanvasObjects
};
