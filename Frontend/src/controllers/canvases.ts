import type {
  AppDispatch
} from '@/store';

import type {
  WhiteboardIdType,
  CanvasIdType,
  CanvasData
} from '@/types/WebSocketProtocol';

import {
  setCanvasObjects
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  setObjectsByCanvas
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

import {
  setAllowedUsersByCanvas
} from '@/store/allowedUsers/allowedUsersByCanvasSlice';

import {
  setCanvases,
  removeCanvases
} from '@/store/canvases/canvasesSlice';

import {
  addCanvasesByWhiteboard,
  removeCanvasesByWhiteboard
} from '@/store/canvases/canvasesByWhiteboardSlice';

import {
  addChildCanvasesByCanvas,
} from '@/store/canvases/childCanvasesByCanvasSlice';

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
    canvasObjectsByCanvas,
    allowedUsersByCanvas
  } = normalizeCanvas(canvas);

  if (canvas.parentCanvas) {
    const parentCanvasId = canvas.parentCanvas.canvasId;

    dispatch(addChildCanvasesByCanvas({
      [parentCanvasId]: [canvas.id],
    }));
  }

  dispatch(setCanvases(canvases));
  dispatch(setCanvasObjects(canvasObjects));
  dispatch(setObjectsByCanvas(canvasObjectsByCanvas));
  dispatch(setAllowedUsersByCanvas(allowedUsersByCanvas));
  dispatch(addCanvasesByWhiteboard({
    [whiteboardId]: [canvas.id]
  }));
};

export const deleteCanvas = (
  dispatch: AppDispatch,
  canvasId: CanvasIdType
) => {
  dispatch(removeCanvases([canvasId]));
  dispatch(removeCanvasesByWhiteboard([canvasId]));
};
