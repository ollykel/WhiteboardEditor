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
