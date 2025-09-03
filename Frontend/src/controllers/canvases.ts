import type {
  AppDispatch
} from '@/store';

import type {
  WhiteboardIdType,
  CanvasData
} from '@/types/WebSocketProtocol';

import type {
  CanvasObjectRecord
} from '@/types/CanvasObjectModel';

import {
  setCanvasObjects
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  addObjectsByCanvas
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

import {
  setCanvases
} from '@/store/canvases/canvasesSlice';

import {
  addCanvasesByWhiteboard
} from '@/stores/canvases/canvasesByWhiteboardsSlice';

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
};
