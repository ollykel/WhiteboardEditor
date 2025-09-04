import { createSelector } from '@reduxjs/toolkit';

import type {
  RootState
} from '@/store';

import type {
  WhiteboardIdType
} from '@/types/WebSocketProtocol';

export const selectWhiteboardById = (state: RootState, whiteboardId: WhiteboardIdType) => (
  state.whiteboards[whiteboardId]
);

export const selectCanvasesForWhiteboard = (state: RootState, whiteboardId: WhiteboardIdType) => (
  state.canvasesByWhiteboard[whiteboardId.toString()]?.map(id => state.canvases[id.toString()]) ?? []
);

export const selectWhiteboardWithCanvases = createSelector(
  [selectWhiteboardById, selectCanvasesForWhiteboard],
  (whiteboard, canvases) => whiteboard ? ({ ...whiteboard, canvases }) : null
);
