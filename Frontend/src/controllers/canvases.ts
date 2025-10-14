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
  } = normalizeCanvas(whiteboardId, canvas);

  const canvasKey : CanvasKeyType = [whiteboardId, canvas.id];

  if (canvas.parentCanvas) {
    const parentCanvasKey = [whiteboardId, canvas.parentCanvas.canvasId];

    dispatch(addChildCanvasesByCanvas({
      [parentCanvasKey.toString()]: [canvasKey],
    }));
  }

  dispatch(setCanvases(canvases));
  dispatch(setCanvasObjects(canvasObjects));
  dispatch(setObjectsByCanvas(canvasObjectsByCanvas));
  dispatch(setAllowedUsersByCanvas(allowedUsersByCanvas));
  dispatch(addCanvasesByWhiteboard({
    [whiteboardId]: [canvasKey]
  }));
};

export const deleteCanvas = (
  dispatch: AppDispatch,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType
) => {
  const canvasKey: CanvasKeyType = [whiteboardId, canvasId];

  dispatch(removeCanvases([canvasKey]));
  dispatch(removeCanvasesByWhiteboard([canvasKey]));
};
