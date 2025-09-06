import type {
  AppDispatch
} from '@/store';

import type {
  WhiteboardIdType,
  CanvasIdType,
  CanvasKeyType,
  CanvasData
} from '@/types/WebSocketProtocol';

import {
  setCanvasObjects
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  setObjectsByCanvas
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

import {
  setCanvases,
  removeCanvases
} from '@/store/canvases/canvasesSlice';

import {
  addCanvasesByWhiteboard
} from '@/store/canvases/canvasesByWhiteboardSlice';

import {
  normalizeCanvas
} from '@/store/canvases/canvasesNormalizers';

export const addCanvas = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  canvas: CanvasData
) => {
  const {
    canvases,
    canvasObjects,
    canvasObjectsByCanvas
  } = normalizeCanvas(whiteboardId, canvas);

  dispatch(setCanvases(canvases));
  dispatch(setCanvasObjects(canvasObjects));
  dispatch(setObjectsByCanvas(canvasObjectsByCanvas));
  dispatch(addCanvasesByWhiteboard({
    [whiteboardId]: [[whiteboardId, canvas.id]]
  }));
};

export const deleteCanvas = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType
) => {
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];

  dispatch(removeCanvases([canvasKey]));
};
