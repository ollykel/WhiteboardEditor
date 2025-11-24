// === WebSocketClientMessengerProvider ========================================
//
// Implements a web-socket based client messenger, to actually communicate with
// the backend server.
//
// =============================================================================

// -- std imports
import {
  useState,
  useRef,
  useContext,
  useCallback,
  type ReactNode,
} from 'react';

import {
  useParams,
} from 'react-router-dom';

// -- third party imports
import {
  useSelector,
} from 'react-redux';

// -- local imports
import {
  CURRENT_EDITOR_NUM_MILLIS,
} from '@/app.config';

import {
  ClientMessengerContext,
} from '@/context/ClientMessengerContext';

import AuthContext from '@/context/AuthContext';

import {
  useUser,
} from '@/hooks/useUser';

import {
  type CanvasAttribs,
} from '@/types/RootState';

import {
  setAllowedUsersByCanvas,
} from '@/store/allowedUsers/allowedUsersByCanvasSlice';

import {
  type ClientMessageLogin,
  type SocketServerMessage,
  type UserIdType,
  type UserSummary,
  type CanvasIdType,
} from '@/types/WebSocketProtocol';

import {
  type IWhiteboardClientMessenger,
} from '@/types/IWhiteboardClientMessenger';

import {
  WhiteboardSocketMessenger,
} from '@/services/whiteboardSocketMessenger';

// -- program state
import {
  store,
  type RootState,
} from '@/store';

import {
  selectCanvasesByWhiteboardId,
} from '@/store/canvases/canvasesSelectors';

import {
  selectActiveUsersByWhiteboard,
} from '@/store/activeUsers/activeUsersSelectors';

import {
  addWhiteboard,
  setCanvasObjects,
  addCanvas,
  deleteCanvas,
  setCurrentEditorByCanvas,
  unsetCurrentEditorByCanvas,
  setActiveUsersByWhiteboard,
} from '@/controllers';

// -- type declarations

export interface WebSocketClientMessengerProviderProps {
  children: ReactNode;
}

const WebSocketClientMessengerProvider = ({
  children,
}: WebSocketClientMessengerProviderProps): React.ReactNode => {
  const {
    whiteboard_id: whiteboardId,
  } = useParams();

  if (! whiteboardId) {
    throw new Error('Could not fetch whiteboardId from url params');
  }

  const authContext = useContext(AuthContext);

  if (! authContext) {
    throw new Error('No AuthContext provided to Whiteboard');
  }

  const {
    user,
  } = useUser();

  const {
    authToken,
  } = authContext;

  const canvases : CanvasAttribs[] = useSelector((state: RootState) => (
    selectCanvasesByWhiteboardId(state, whiteboardId)
  ));

  const activeUsersByClientId = useSelector((state: RootState) => (
    selectActiveUsersByWhiteboard(state, whiteboardId)
  ));

  const wsUriScheme : 'ws' | 'wss' = window.location.protocol === 'https' ? 'wss' : 'ws';
  const wsUri = `${wsUriScheme}://${window.location.host}/ws/${whiteboardId}`;
  const ws : WebSocket = new WebSocket(wsUri);
  const dispatch = store.dispatch;

  const [clientMessenger, setClientMessenger] = useState<IWhiteboardClientMessenger | null>(null);
  const currentEditorTimeoutsByCanvasRef = useRef<Record<CanvasIdType, number>>({});

  // handles incoming web socket messages
  const handleServerMessage = useCallback(
    (event: MessageEvent): void => {
      console.log('Raw WebSocket message received:', event.data);

      try {
        const msg = JSON.parse(event.data) as SocketServerMessage;
        console.log('Parsed message:', msg);

        switch (msg.type) {
          case 'init_client':
            {
              const { whiteboard, activeClients } = msg;

              const activeUsers: UserSummary[] = Object.values(activeClients);

              addWhiteboard(dispatch, whiteboard);
              setActiveUsersByWhiteboard(dispatch, whiteboardId, activeUsers);
            }
            break;
          case 'active_users': 
            {
              const {
                users,
              } = msg;

              const activeUsersSet : Record<UserIdType, boolean> = Object.fromEntries(
                users.map(userSummary => [userSummary.userId, true])
              );
              setActiveUsersByWhiteboard(dispatch, whiteboardId, users);

              // -- unset current editors who are no longer logged in
              const removedEditorCanvasIds : CanvasIdType[] = canvases
                .filter(canvas => canvas.currentEditorUserId && ! (canvas.currentEditorUserId in activeUsersSet))
                .map(canvas => canvas.id);
              
              for (const canvasId of removedEditorCanvasIds) {
                unsetCurrentEditorByCanvas(dispatch, canvasId);
              }// -- end for canvasId
            } 
            break;
          case 'editing_canvas':
            {
              const {
                clientId,
                canvasId,
              } = msg;

              const userId : UserIdType | undefined = activeUsersByClientId[clientId].userId;

              if (! userId) {
                console.error('Could not find user ID for client', clientId);
              } else {
                setCurrentEditorByCanvas(dispatch, canvasId, userId);

                // -- set current editor timeout
                const oldCurrentEditorTimeoutId = currentEditorTimeoutsByCanvasRef.current[canvasId];

                if (oldCurrentEditorTimeoutId) {
                  window.clearTimeout(oldCurrentEditorTimeoutId);
                  currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                }

                currentEditorTimeoutsByCanvasRef.current[canvasId] = window.setTimeout(
                  () => {
                    unsetCurrentEditorByCanvas(dispatch, canvasId);
                    window.clearTimeout(currentEditorTimeoutsByCanvasRef.current[canvasId]);
                    currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                  },
                  CURRENT_EDITOR_NUM_MILLIS
                );
              }
            }
            break;
          case 'create_shapes':
            {
              const {
                clientId,
                canvasId,
                shapes,
              } = msg;

              const userId : UserIdType | undefined = activeUsersByClientId[clientId].userId;

              if (! userId) {
                console.error('Could not find user ID for client', clientId);
              } else {
                setCanvasObjects(dispatch, canvasId, shapes);
                setCurrentEditorByCanvas(dispatch, canvasId, userId);

                const oldCurrentEditorTimeoutId = currentEditorTimeoutsByCanvasRef.current[canvasId];

                if (oldCurrentEditorTimeoutId) {
                  window.clearTimeout(oldCurrentEditorTimeoutId);
                  currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                }

                currentEditorTimeoutsByCanvasRef.current[canvasId] = window.setTimeout(
                  () => {
                    unsetCurrentEditorByCanvas(dispatch, canvasId);
                    window.clearTimeout(currentEditorTimeoutsByCanvasRef.current[canvasId]);
                    currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                  },
                  CURRENT_EDITOR_NUM_MILLIS
                );
              }
            }
            break;
          case 'update_shapes':
            {
              const {
                clientId,
                canvasId,
                shapes,
              } = msg;

              const userId : UserIdType | undefined = activeUsersByClientId[clientId].userId;

              if (! userId) {
                console.error('Could not find user ID for client', clientId);
              } else {
                setCanvasObjects(dispatch, canvasId, shapes);
                setCurrentEditorByCanvas(dispatch, canvasId, userId);

                const oldCurrentEditorTimeoutId = currentEditorTimeoutsByCanvasRef.current[canvasId];

                if (oldCurrentEditorTimeoutId) {
                  clearTimeout(oldCurrentEditorTimeoutId);
                  currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                }

                currentEditorTimeoutsByCanvasRef.current[canvasId] = window.setTimeout(
                  () => {
                    unsetCurrentEditorByCanvas(dispatch, canvasId);
                    clearTimeout(currentEditorTimeoutsByCanvasRef.current[canvasId]);
                    currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                  },
                  CURRENT_EDITOR_NUM_MILLIS
                );
              }
            }
            break;
          case 'create_canvas':
            {
              const { canvas } = msg;

              addCanvas(dispatch, whiteboardId, canvas);
            }
            break;
          case 'delete_canvases':
            {
              const {
                canvasIds,
              } = msg;

              for (const canvasId of canvasIds) {
                deleteCanvas(dispatch, canvasId);
              }// end for (const canvasId of canvasIds)
            }
            break;
          case 'update_canvas_allowed_users': 
          {
            const {
              canvasId,
              allowedUsers,
            } = msg;

            dispatch(setAllowedUsersByCanvas({ [canvasId]: allowedUsers }));
          }
          break;
          case 'individual_error':
          case 'broadcast_error':
            {
              const { error } = msg;

              switch (error.type) {
                case 'invalid_message':
                  console.error('Socket error: invalid message:', error.clientMessageRaw);
                  break;
                case 'unauthorized':
                  console.error('Socket error: not authorized to view this whiteboard');
                  break;
                case 'not_authenticated':
                  console.error('Socket error: client not authenticated');
                  break;
                case 'already_authorized':
                  console.error('Socket error: client cannot authenticate again');
                  break;
                case 'invalid_auth':
                  console.error('Socket error: auth token invalid');
                  break;
                case 'auth_token_expired':
                  console.error('Socket error: auth token expired');
                  break;
                case 'user_not_found':
                  console.error(`Socket error: user ${error.userId} not found`);
                  break;
                case 'whiteboard_not_found':
                  console.error(`Socket error: whiteboard ${error.whiteboardId} not found`);
                  break;
                case 'canvas_not_found':
                  console.error(`Socket error: canvas ${error.canvasId} not found`);
                  break;
                case 'action_forbidden':
                  console.error(`Socket error: action ${error.action} not permitted`);
                  break;
                case 'other':
                  console.error('Socket error:', error.message);
                  break;
                default:
                  throw new Error(`Unrecognized error: ${JSON.stringify(error, null, 2)}`);
              }// -- end switch (error.type)
            }
            break;
          default:
            console.log('Server Message unrecognized:', msg);
            throw new Error(`Server Message unrecognized: ${JSON.stringify(msg, null, 2)}`);
        }// end switch (msg.type)
      } catch (e) {
        console.log('Failed to parse message:', e);
      }
    },
    [dispatch]
  );// -- end handleServerMessage

  ws.onopen = () => {
    // Send login/auth message with user ID, if currently logged in
    if (! user) {
      console.error('Cannot log into web socket server without authenticated user');
    } else if (! authToken) {
      console.error('Cannot log into web socket server without authentication token');
    } else {
      const messenger = new WhiteboardSocketMessenger(ws);
      const loginMessage : ClientMessageLogin = {
        type: "login",
        jwt: authToken,
      };

      console.log('Sending login message:', loginMessage);

      messenger.sendLogin(loginMessage);
      setClientMessenger(messenger);
    }

    console.log(`Established web socket connection to ${wsUri}`);

    ws.onmessage = handleServerMessage;
  };

  return (
    <ClientMessengerContext.Provider value={{
      clientMessenger,
    }}>
      {children}
    </ClientMessengerContext.Provider>
  );
};// -- end WebSocketClientMessengerProvider

export {
  WebSocketClientMessengerProvider,
};
