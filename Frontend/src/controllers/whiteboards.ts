import type {
  AppDispatch
} from '@/store';

import type {
  WhiteboardData
} from '@/types/WebSocketProtocol';

import {
  setCanvasObjects
} from '@/store/canvasObjects/canvasObjectsSlice';

import {
  setObjectsByCanvas
} from '@/store/canvasObjects/canvasObjectsByCanvasSlice';

import {
  setChildCanvasesByCanvas,
} from '@/store/canvases/childCanvasesByCanvasSlice';

import {
  setCanvases
} from '@/store/canvases/canvasesSlice';

import {
  setCanvasesByWhiteboard
} from '@/store/canvases/canvasesByWhiteboardSlice';

import {
  setAllowedUsersByCanvas,
} from '@/store/allowedUsers/allowedUsersByCanvasSlice';

import {
  normalizeWhiteboard
} from '@/store/whiteboards/whiteboardsNormalizers';

import {
  setWhiteboards
} from '@/store/whiteboards/whiteboardsSlice';

export const addWhiteboard = (
  dispatch: AppDispatch,
  whiteboard: WhiteboardData
) => {
  const {
    whiteboards,
    canvases,
    childCanvasesByCanvas,
    canvasesByWhiteboard,
    canvasObjects,
    canvasObjectsByCanvas,
    allowedUsersByCanvas,
  } = normalizeWhiteboard(whiteboard);

  dispatch(setWhiteboards(whiteboards));
  dispatch(setCanvases(canvases));
  dispatch(setCanvasObjects(canvasObjects));
  dispatch(setChildCanvasesByCanvas(childCanvasesByCanvas));
  dispatch(setObjectsByCanvas(canvasObjectsByCanvas));
  dispatch(setCanvasesByWhiteboard(canvasesByWhiteboard));
  dispatch(setAllowedUsersByCanvas(allowedUsersByCanvas));
};
