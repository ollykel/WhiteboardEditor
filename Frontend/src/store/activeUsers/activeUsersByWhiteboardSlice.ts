import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import {
  type ClientIdType,
  type WhiteboardIdType,
  type UserSummary,
} from '@/types/WebSocketProtocol';

type ActiveUsersByWhiteboardState = Record<WhiteboardIdType, Record<ClientIdType, UserSummary>>;

type RemoveActiveUsersByWhiteboardPayload = PayloadAction<{
  whiteboardId: WhiteboardIdType;
  clientId: ClientIdType;
}>;

const initialState : ActiveUsersByWhiteboardState = {};

export const activeUsersByWhiteboardSlice = createSlice({
  name: 'activeUsersByWhiteboard',
  initialState,
  reducers: {
    setActiveUsersByWhiteboard(state, action: PayloadAction<ActiveUsersByWhiteboardState>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addActiveUsersByWhiteboard(state, action: PayloadAction<ActiveUsersByWhiteboardState>) {
      const newState : ActiveUsersByWhiteboardState = { ...state };

      for (const [whiteboardId, userSummariesByWhiteboardId] of Object.entries(action.payload)) {
        if (whiteboardId in newState) {
          newState[whiteboardId] = {
            ...newState[whiteboardId],
            ...userSummariesByWhiteboardId
          };
        } else {
          newState[whiteboardId] = userSummariesByWhiteboardId;
        }
      }// -- end for whiteboardId, userSummariesByWhiteboardId

      return newState;
    },
    removeActiveUserByWhiteboard(state, action: RemoveActiveUsersByWhiteboardPayload) {
      const newState = { ...state };
      const {
        whiteboardId,
        clientId,
      } = action.payload;

      if (whiteboardId in newState) {
        delete newState[whiteboardId][clientId];
      }

      return newState;
    },
  },
});// -- end activeUsersByWhiteboardSlice

export const {
  setActiveUsersByWhiteboard,
  addActiveUsersByWhiteboard,
  removeActiveUserByWhiteboard,
} = activeUsersByWhiteboardSlice.actions;

export default activeUsersByWhiteboardSlice.reducer;
