import type {
  RootState
} from '@/store';

import {
  type ClientIdType,
  type UserSummary,
  type WhiteboardIdType,
  type CanvasIdType,
} from '@/types/WebSocketProtocol';

export const selectActiveUsersByWhiteboard = (state: RootState, wid: WhiteboardIdType) : Record<ClientIdType, UserSummary> | null => {
  return state.activeUsersByWhiteboard[wid] || null;
};

export const selectCurrentEditorByCanvas = (
  state: RootState,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType
): UserSummary | null => {
  return state.activeUsersByWhiteboard[whiteboardId][state.currentEditorsByCanvas.currentEditorsByCanvas[canvasId]] || null;
};
