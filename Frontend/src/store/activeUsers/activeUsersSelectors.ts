import type {
  RootState
} from '@/store';

import {
  type ClientIdType,
  type UserSummary,
  type WhiteboardIdType,
  type CanvasIdType,
} from '@/types/WebSocketProtocol';

export const selectActiveUsersByWhiteboard = (state: RootState, wid: WhiteboardIdType) : Record<ClientIdType, UserSummary> => {
  return Object.fromEntries(
    Object.keys(state.activeUsersByWhiteboard.clientsByWhiteboard[wid] || {}).map(clientId => [
      clientId, state.activeUsers[clientId]
    ])
  );
};

export const selectCurrentEditorByCanvas = (
  state: RootState,
  canvasId: CanvasIdType
): UserSummary | null => {
  return state.activeUsers[state.currentEditorsByCanvas.currentEditorsByCanvas[canvasId]] || null;
};
