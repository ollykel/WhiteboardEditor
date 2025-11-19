import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import {
  type ClientIdType,
  type WhiteboardIdType,
} from '@/types/WebSocketProtocol';

type ActiveUsersByWhiteboardState = Record<WhiteboardIdType, ClientIdType[]>;

const initialState : ActiveUsersByWhiteboardState = {};

export const activeUsersByWhiteboardSlice = createSlice({
  name: 'activeUsersByWhiteboard',
  initialState,
  reducers: {
    setActiveUsersByWhiteboard(state, action: PayloadAction<Record<WhiteboardIdType, ClientIdType[]>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    addActiveUsersByWhiteboard(state, action: PayloadAction<Record<WhiteboardIdType, ClientIdType[]>>) {
      const newState : Record<WhiteboardIdType, ClientIdType[]> = { ...state };

      for (const [whiteboardId, newClientIds] of Object.entries(action.payload)) {
        if (whiteboardId in newState) {
          newState[whiteboardId] = Object.keys({
            ...Object.fromEntries(newState[whiteboardId].map(clientId => [clientId, true])),
            ...Object.fromEntries(newClientIds.map(clientId => [clientId, true])),
          }).map(k => parseInt(k));
        } else {
          newState[whiteboardId] = newClientIds;
        }
      }// -- end for whiteboardId, newClientIds

      return newState;
    },
    removeActiveUsersByWhiteboard(state, action: PayloadAction<WhiteboardIdType[]>) {
      const newState = { ...state };

      for (const whiteboardId of action.payload) {
        delete newState[whiteboardId];
      }// -- end for whiteboardId

      return newState;
    },
  },
});// -- end activeUsersByWhiteboardSlice

export const {
  setActiveUsersByWhiteboard,
  addActiveUsersByWhiteboard,
  removeActiveUsersByWhiteboard,
} = activeUsersByWhiteboardSlice.actions;

export default activeUsersByWhiteboardSlice.reducer;
