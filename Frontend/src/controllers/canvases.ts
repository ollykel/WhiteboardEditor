import type {
  AppDispatch
} from '@/store';

import type {
  WhiteboardIdType,
  CanvasData
} from '@/types/WebSocketProtocol';

import {
  setCanvasObjects
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  setObjectsByCanvas
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

import {
  setCanvases
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

  console.log('!! addCanvas');

  dispatch(setCanvases(canvases));
  dispatch(setCanvasObjects(canvasObjects));
  dispatch(setObjectsByCanvas(canvasObjectsByCanvas));
  dispatch(addCanvasesByWhiteboard({
    [whiteboardId]: [[whiteboardId, canvas.id]]
  }));
};
