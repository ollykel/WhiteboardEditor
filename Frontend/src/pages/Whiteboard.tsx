// -- std imports
import {
  useState,
  useRef,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  type RefObject,
} from 'react';

import {
  useParams
} from 'react-router-dom';

import {
  useSelector
} from 'react-redux';

// -- third-party imports
import {
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import { X } from 'lucide-react';

import Konva from 'konva';

// -- local types
import {
  APP_NAME,
  CURRENT_EDITOR_NUM_MILLIS,
} from '@/app.config';

import {
  axiosResponseIsError,
  type Whiteboard as APIWhiteboard,
  type UserPermissionEnum,
  type UserPermission,
  type ErrorResponse as APIErrorResponse,
} from '@/types/APIProtocol';

// -- program state
import {
  store,
  type RootState
} from '@/store';

import {
  addWhiteboard,
  setCanvasObjects,
  addCanvas,
  deleteCanvas,
  addActiveUser,
} from '@/controllers';

import {
  selectActiveUsers,
} from '@/store/activeUsers/activeUsersSelectors';

import {
  selectWhiteboardById
} from '@/store/whiteboards/whiteboardsSelectors';

import {
  selectCanvasesWithObjectsByWhiteboardId
} from '@/store/canvases/canvasesSelectors';

import {
  selectCanvasObjectsByWhiteboard
} from '@/store/canvasObjects/canvasObjectsSelectors';

import WhiteboardContext, {
  WhiteboardProvider
} from "@/context/WhiteboardContext";

import AuthContext from '@/context/AuthContext';

import api from '@/api/axios';

import {
  type AxiosResponse as AxiosResp,
} from 'axios';

import { useModal } from '@/components/Modal';

import Page from '@/components/Page';
import CanvasCard from "@/components/CanvasCard";
import Sidebar from "@/components/Sidebar";
import Toolbar from "@/components/Toolbar";
import ShapeAttributesMenu from "@/components/ShapeAttributesMenu";
import HeaderButton from '@/components/HeaderButton';
import HeaderAuthed from '@/components/HeaderAuthed';
import shapeAttributesReducer from '@/reducers/shapeAttributesReducer';
import type { ToolChoice } from '@/components/Tool';

import type {
  CanvasObjectIdType,
  CanvasObjectModel,
} from '@/types/CanvasObjectModel';

import ShareWhiteboardForm, {
  type ShareWhiteboardFormData
} from '@/components/ShareWhiteboardForm';

import CreateCanvasMenu, {
  type NewCanvas,
} from '@/components/CreateCanvasMenu'

import {
  type NewCanvasDimensions,
} from '@/types/CreateCanvas';

import type {
  SocketServerMessage,
  UserIdType,
  ClientIdType,
  ClientMessageLogin,
  ClientMessageUpdateShapes,
  ClientMessageCreateCanvas,
  CanvasData,
  CanvasIdType,
  CanvasKeyType,
  WhiteboardIdType,
  WhiteboardAttribs,
  UserSummary,
} from '@/types/WebSocketProtocol';

import { useUser } from '@/hooks/useUser';
import { setAllowedUsersByCanvas } from '@/store/allowedUsers/allowedUsersByCanvasSlice';
import { setActiveUser } from '@/controllers/activeUsers';
import { type OperationDispatcher } from '@/types/OperationDispatcher';

type ComponentStatus = 
  | { status: 'ready'; }
  | { status: 'pending'; }
  | { status: 'error'; error: string; }
;

const getWebSocketUri = (wid: WhiteboardIdType): string => {
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUri = `${wsScheme}://${window.location.host}/ws/${wid}`;

    return wsUri;
};

const Whiteboard = () => {
  // Inputs:
  //  - whiteboard id
  //  - list of canvases
  //  - tool choice

  // -- references
  const context = useContext(WhiteboardContext);
  const authContext = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { user } = useUser();

  const {
    whiteboard_id: whiteboardId
  } = useParams();

  if (! whiteboardId) {
    throw new Error('No whiteboard id provided');
  }

  if (! context) {
    throw new Error('No WhiteboardContext provided to Whiteboard');
  }

  if (! authContext) {
    throw new Error('No AuthContext provided to Whiteboard');
  }

  const {
    socketRef,
    setWhiteboardId,
    sharedUsers,
    ownPermission,
    currentTool,
    setCurrentTool,
    setSelectedShapeIds,
  } = context;

  const {
    authToken,
  } = authContext;

  // -- prop-derived state
  const whiteboardKey = ['whiteboard', whiteboardId];

  // -- managed state
  const {
    isLoading: isWhiteboardLoading,
    isFetching: isWhiteboardFetching,
    error: whiteboardError,
  } = useQuery<APIWhiteboard, string>({
    queryKey: whiteboardKey,
    queryFn: async (): Promise<APIWhiteboard> => {
      const res : AxiosResp<APIWhiteboard> | AxiosResp<APIErrorResponse> = await api.get(
        `/whiteboards/${whiteboardId}`
      );

      if (axiosResponseIsError(res)) {
        throw new Error(res.data.message || 'whiteboard request failed');
      } else {
        // success
        return res.data;
      }
    }
  });
  const whiteboardIdRef = useRef<WhiteboardIdType>(whiteboardId);
  const currentEditorTimeoutsByCanvasRef = useRef<Record<CanvasIdType, number>>({});

  // alert user of any errors fetching whiteboard
  useEffect(
    () => {
      if (whiteboardError) {
        console.error('Error fetching whiteboard', whiteboardId, ':', whiteboardError);
        alert(`Error fetching whiteboard: ${whiteboardError}`);
      }
    }, [whiteboardError, whiteboardId]
  );

  // dirty trick to keep whiteboardIdRef in-sync with whiteboardId
  useEffect(() => {
    whiteboardIdRef.current = whiteboardId;
  }, [whiteboardId]);

  const [shapeAttributesState, dispatchShapeAttributes] = useReducer(shapeAttributesReducer, {
    x: 0,
    y: 0,
    rotation: 0,
    fillColor: '#999999',
    strokeColor: '#000000',
    strokeWidth: 1,
    fontSize: 20,
    color: '#000000',
  });

  const activeUsers : Record<ClientIdType, UserSummary> = useSelector(selectActiveUsers);

  const currWhiteboard: WhiteboardAttribs | null = useSelector((state: RootState) => (
    selectWhiteboardById(state, whiteboardId))
  );

  console.log('Current Whiteboard:', currWhiteboard);

  const canvases: CanvasData[] = useSelector((state: RootState) => {
    console.log('Current State:', state);
    return selectCanvasesWithObjectsByWhiteboardId(state, whiteboardId)
  });

  const childCanvasesByCanvas : Record<string, CanvasKeyType[]> = useSelector(
    (state: RootState) => state['childCanvasesByCanvas']
  );

  const [currentEditorByCanvas, setCurrentEditorByCanvas] = useState<Record<string, string>>({});

  const dispatch = store.dispatch;

  // handles all web socket messages
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

              setWhiteboardId(whiteboard.id);
              addWhiteboard(dispatch, whiteboard);
              addActiveUser(dispatch, activeUsers);
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
              setCurrentEditorByCanvas(prev => Object.fromEntries(Object.entries(prev).filter(
                ([_canvasId, editorId]) => editorId in activeUsersSet
              )));
              setActiveUser(dispatch, users);
            } 
            break;
          case 'editing_canvas':
            {
              const {
                clientId,
                canvasId,
              } = msg;

              setCurrentEditorByCanvas(prev => ({
                ...prev,
                [canvasId]: activeUsers[clientId].userId,
              }));

              const oldCurrentEditorTimeoutId = currentEditorTimeoutsByCanvasRef.current[canvasId];

              if (oldCurrentEditorTimeoutId) {
                window.clearTimeout(oldCurrentEditorTimeoutId);
                currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
              }

              currentEditorTimeoutsByCanvasRef.current[canvasId] = window.setTimeout(
                () => {
                  setCurrentEditorByCanvas(prev => Object.fromEntries(Object.entries(prev).filter(
                    ([k, _v]) => k !== canvasId
                  )));
                  window.clearTimeout(currentEditorTimeoutsByCanvasRef.current[canvasId]);
                  currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                },
                CURRENT_EDITOR_NUM_MILLIS
              );
            }
            break;
          case 'create_shapes':
            {
              const {
                clientId,
                canvasId,
                shapes,
              } = msg;

              setCurrentEditorByCanvas(prev => ({
                ...prev,
                [canvasId]: activeUsers[clientId].userId,
              }));
              setCanvasObjects(dispatch, whiteboardIdRef.current, canvasId, shapes);

              const oldCurrentEditorTimeoutId = currentEditorTimeoutsByCanvasRef.current[canvasId];

              if (oldCurrentEditorTimeoutId) {
                window.clearTimeout(oldCurrentEditorTimeoutId);
                currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
              }

              currentEditorTimeoutsByCanvasRef.current[canvasId] = window.setTimeout(
                () => {
                  setCurrentEditorByCanvas(prev => Object.fromEntries(Object.entries(prev).filter(
                    ([k, _v]) => k !== canvasId
                  )));
                  window.clearTimeout(currentEditorTimeoutsByCanvasRef.current[canvasId]);
                  currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                },
                CURRENT_EDITOR_NUM_MILLIS
              );
            }
            break;
          case 'update_shapes':
            {
              const {
                clientId,
                canvasId,
                shapes,
              } = msg;

              setCurrentEditorByCanvas(prev => ({
                ...prev,
                [canvasId]: activeUsers[clientId].userId,
              }));
              setCanvasObjects(dispatch, whiteboardIdRef.current, canvasId, shapes);

              const oldCurrentEditorTimeoutId = currentEditorTimeoutsByCanvasRef.current[canvasId];

              if (oldCurrentEditorTimeoutId) {
                clearTimeout(oldCurrentEditorTimeoutId);
                currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
              }

              currentEditorTimeoutsByCanvasRef.current[canvasId] = window.setTimeout(
                () => {
                  setCurrentEditorByCanvas(prev => Object.fromEntries(Object.entries(prev).filter(
                    ([k, _v]) => k !== canvasId
                  )));
                  clearTimeout(currentEditorTimeoutsByCanvasRef.current[canvasId]);
                  currentEditorTimeoutsByCanvasRef.current[canvasId] = 0;
                },
                CURRENT_EDITOR_NUM_MILLIS
              );
            }
            break;
          case 'create_canvas':
            {
              const { canvas } = msg;

              addCanvas(dispatch, whiteboardIdRef.current, canvas);
            }
            break;
          case 'delete_canvases':
            {
              const { canvasIds } = msg;

              for (const canvasId of canvasIds) {
                deleteCanvas(dispatch, whiteboardIdRef.current, canvasId);
              }// end for (const canvasId of canvasIds)
            }
            break;
          case 'update_canvas_allowed_users': 
          {
            const { canvasId, allowedUsers } = msg;
            const canvasKey: CanvasKeyType = [whiteboardIdRef.current, canvasId];
            const canvasKeyString = canvasKey.toString();

            dispatch(setAllowedUsersByCanvas({ [canvasKeyString]: allowedUsers }));
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
    [activeUsers, dispatch, setWhiteboardId]
  );// -- end handleServerMessage

  // -- set up web socket connection
  useEffect(
    () => {
      console.log('Initializing web socket connection ...');
      // TODO: get whiteboard id from path params
      const wsUri = getWebSocketUri(whiteboardId);
      const ws = new WebSocket(wsUri);

      ws.onopen = () => {
        // Send login/auth message with user ID, if currently logged in
        if (! user) {
          console.error('Cannot log into web socket server without authenticated user');
        } else if (! authToken) {
          console.error('Cannot log into web socket server without authentication token');
        } else {
          const loginMessage : ClientMessageLogin = {
            type: "login",
            jwt: authToken,
          };
          console.log('Sending login message:', loginMessage);
          ws.send(JSON.stringify(loginMessage));
        }

        console.log(`Established web socket connection to ${wsUri}`);
        socketRef.current = ws;
      };
      ws.onerror = () => {
        console.log(`Failed to establish web socket connection to ${wsUri}`);
        socketRef.current = null;
      };

      // -- handled in another useEffect below
      ws.onmessage = handleServerMessage;

      return () => {
        ws.close();
      }
    },
    // -- can't make handleServerMessage a dependency, as it will result in an
    //    infinite loop
    [socketRef, whiteboardId, user, authToken]
  );

  // -- update the web socket message handler
  useEffect(
    () => {
      if (socketRef.current) {
        socketRef.current.onmessage = handleServerMessage;
      }
    },
    [socketRef, handleServerMessage]
  );

  const {
    Modal: ShareModal,
    openModal: openShareModal,
    closeModal: closeShareModal
  } = useModal();

  const {
    Modal: CreateCanvasModal,
    openModal: openCreateCanvasModal,
    closeModal: closeCreateCanvasModal,
  } = useModal();

  const [newCanvasDimensions, setNewCanvasDimensions] = useState<NewCanvasDimensions | null>(null);
  const [newCanvasParentId, setNewCanvasParentId] = useState<CanvasIdType | null>(null);

  // -- derived state
  let status : ComponentStatus;

  if (isWhiteboardLoading || isWhiteboardFetching || (! currWhiteboard) || (! socketRef.current)) {
    status = { status: 'pending' };
  } else if (whiteboardError) {
    status = { status: 'error', error: whiteboardError };
  } else {
    status = { status: 'ready' };
  }

  switch (status.status) {
    case 'pending':
    {
        const isActive = !!socketRef.current;

        return (
          <Page
            title="Loading ..."
          >
            <main>
              {/* Header */}
              <HeaderAuthed 
                title="Loading ..."
                zIndex={10}
              />
              {
                /** Display if socket not connected **/
                (! isActive) && (
                  <p className="text-lg font-bold text-red-600">
                    Connecting ...
                  </p>
                )
              }
            </main>
          </Page>
        );
    }
    case 'error':
    {
        const {
          error,
        } = status;

        return (
          <Page
            title="Error Loading Whiteboard"
          >
            <main>
              {/* Header */}
              <HeaderAuthed 
                title="Error Loading Whiteboard"
                zIndex={10}
              />

              <p className="text-xl font-semibold font-red">
                Error: {error}
              </p>
            </main>
          </Page>
        );
    }
    case 'ready':
    {
      const canvasesByKey : Record<string, CanvasData> = Object.fromEntries(canvases.map(
        canvasData => [
          [whiteboardId, canvasData.id].toString(),
          canvasData
        ]
      ));
      
      const rootCanvasId = currWhiteboard.rootCanvas;
      
      const canvasesSorted = [...canvases];
      
      canvasesSorted.sort((a, b) => new Date(a.timeCreated) < new Date(b.timeCreated) ? -1 : 1);
      
      const title = currWhiteboard.name;
      
      // --- misc functions
      const handleCreateCanvasDimensions = (parentCanvasId: CanvasIdType, dimensions: NewCanvasDimensions) => {
          setNewCanvasDimensions(dimensions);
          setNewCanvasParentId(parentCanvasId);
          openCreateCanvasModal();
      };

      const handleNewCanvas = (canvas: NewCanvas) => {
        // Send message to server.
        // Server will echo response back, and actually inserting the new canvas
        // will be handled by handleServerMessage.
        // TODO: allow setting custom canvas sizes
        if (socketRef.current && newCanvasParentId && newCanvasDimensions) {
          const createCanvasMsg : ClientMessageCreateCanvas = ({
            type: 'create_canvas',
            width: newCanvasDimensions.width,
            height: newCanvasDimensions.height,
            name: canvas.canvasName,
            parentCanvas: {
              canvasId: newCanvasParentId,
              originX: newCanvasDimensions.originX,
              originY: newCanvasDimensions.originY,
            },
            allowedUsers: canvas.allowedUsers,
          });
      
          socketRef.current.send(JSON.stringify(createCanvasMsg));
          setNewCanvasParentId(null);
          setNewCanvasDimensions(null);
        }
      };
      
      // -- Header elements
      const ShareWhiteboardButton = () => (
        <HeaderButton 
          onClick={() => {
            openShareModal();
          }}
          title="Share"
          disabled={ownPermission !== 'own'}
        /> 
      );
      
      const pageTitle = `${title} | ${APP_NAME}`;
      
      return (
        <Page
          title={pageTitle}
        >
          <main>
            {/* Header */}
            <HeaderAuthed 
              title={title}
              zIndex={10}
              toolbarElemsLeft={[
                <ShareWhiteboardButton />
              ]}
              noMarginTop={true}
            />
      
            {/* Content */}
            <div className="">
              {/**
                Left-hand sidebar for toolbar and menus
                Not displayed in view-only mode.
              **/
              }
              {(ownPermission && (ownPermission !== 'view')) && (
                <Sidebar
                  side="left"
                  zIndex={10}
                >
                  {/* Toolbar */}
                  <Toolbar
                    toolChoice={currentTool}
                    onToolChange={(choice) => {
                      setSelectedShapeIds([]);
                      setCurrentTool(choice);
                    }}
                  />
      
                  {/** Shape Attributes Menu **/}
                  <ShapeAttributesMenu
                    attributes={shapeAttributesState}
                    dispatch={dispatchShapeAttributes}
                  />
                </Sidebar>
              )}
      
              {/* Canvas Container */}
              <div className="flex flex-col justify-center flex-wrap">
                
                {/** Misc. info **/}
                <div className="fixed top-20 left-2 right-0 z-50 flex flex-col justify-center flex-wrap">
                  {/** Indicate if the user is in view-only mode **/}
                  {(ownPermission && (ownPermission === 'view')) && (
                    <div>
                      <span>
                        <strong
                          className="text-xl font-bold"
                        >
                          You are in view-only mode
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
      
                {/* Display Canvases */}
                <div className="flex flex-1 flex-row justify-center flex-wrap">
                  <CanvasCard
                    whiteboardId={whiteboardId}
                    rootCanvasId={rootCanvasId}
                    shapeAttributes={shapeAttributesState}
                    currentTool={currentTool}
                    canvasesByKey={canvasesByKey}
                    childCanvasesByCanvas={childCanvasesByCanvas}
                    currentEditorByCanvas={currentEditorByCanvas}
                    onSelectCanvasDimensions={handleCreateCanvasDimensions}
                  />
                </div>
              </div>
            </div>
      
            {/** Modal that opens to share the whiteboard **/}
            <ShareModal zIndex={20}>
              <div className="flex flex-col">
                <button
                  onClick={closeShareModal}
                  className="flex flex-row justify-end hover:cursor-pointer"
                >
                  <X />
                </button>
      
                <h2 className="text-md font-bold text-center">Share Whiteboard</h2>
      
                <ShareWhiteboardForm
                  initUserPermissions={sharedUsers || []}
                  onSubmit={async (data: ShareWhiteboardFormData) => {
                    try {
                      const {
                        userPermissions
                      } = data;
      
                      const userPermissionsFinal = userPermissions.map(perm => {
                        if (perm.type === 'user') {
                          if ((typeof perm.user) === 'object') {
                            // extract object id
                            return ({
                              ...perm,
                              user: perm.user.id
                            });
                          } else {
                            // already object id
                            return perm;
                          }
                        } else {
                          return perm;
                        }
                      });
      
                      // No need for AxiosResp<..> type check, as response body
                      // isn't used.
                      const res = await api.post(`/whiteboards/${whiteboardId}/shared_users`, ({
                        userPermissions: userPermissionsFinal
                      }));
      
                      if (res.status >= 400) {
                        console.error('POST /whiteboards/:id/shared_users failed:', res.data);
                        alert(`Share request failed: ${JSON.stringify(res.data)}`);
                      } else {
                        console.log('Share request submitted successfully');
                        alert('Share request submitted successfully');
                        queryClient.invalidateQueries({
                          queryKey: whiteboardKey
                        });
                      }
                    } finally {
                      closeShareModal();
                    }
                  }}
                />
              </div>
            </ShareModal>
      
            {/** Create Canvas Modal **/}
            <CreateCanvasModal
              zIndex={20}
              className="p-4 rounded-sm"
            >
              <CreateCanvasMenu 
                onCreate={(canvas) => {
                  handleNewCanvas(canvas);
                  closeCreateCanvasModal();
                }}
                onCancel={closeCreateCanvasModal}
              />
            </CreateCanvasModal>
          </main>
        </Page>
      );
    }
    default:
      throw new Error(`Unrecognized component status: ${status}`);
  };
};// end Whiteboard

const WrappedWhiteboard = () => {
  const authContext = useContext(AuthContext);
  const socketRef = useRef<WebSocket | null>(null);
  const [whiteboardId, setWhiteboardId] = useState<WhiteboardIdType>("");
  const [newCanvasAllowedUsers, setNewCanvasAllowedUsers] = useState<string[]>([]);
  const [selectedShapeIds, setSelectedShapeIds] = useState<CanvasObjectIdType[]>([]);
  const [currentDispatcher, setCurrentDispatcher] = useState<OperationDispatcher | null>(null);
  const [selectedCanvasId, setSelectedCanvasId] = useState<CanvasIdType | null>(null);

  const { data: whiteboardData, isLoading: isWhiteboardDataLoading } = useQuery<APIWhiteboard, string>({
    queryKey: ['whiteboard', whiteboardId],
    enabled: !!whiteboardId, // Only run query when whiteboardId exists
    queryFn: async () => {
      if (! whiteboardId) {
        throw new Error('No whiteboard ID provided');
      }

      console.log('Fetching whiteboard data for ID:', whiteboardId);

      const res : AxiosResp<APIWhiteboard> | AxiosResp<APIErrorResponse> = await api.get(
        `/whiteboards/${whiteboardId}`
      );

      if (axiosResponseIsError(res)) {
        throw new Error(res.data.message || 'Failed');
      } else {
        console.log('API Response:', res.data);
        return res.data;
      }
    },
  });

  if (! authContext) {
    throw new Error('AuthContext not provided to Whiteboard');
  }

  const {
    user,
  } = authContext;

  console.log("Current whiteboard data:", whiteboardData);
  console.log("Loading status:", isWhiteboardDataLoading);

  // update the state of sharedUsers whenever whiteboardData changes
  const [sharedUsers, setSharedUsers] = useState<APIWhiteboard['shared_users']>([]);
  console.log("Current shared users:", sharedUsers);

  // -- view/edit/own - determines which actions to enable or disable
  const [ownPermission, setOwnPermission] = useState<UserPermissionEnum | null>(null);

  useEffect(() => {
    if (whiteboardData && user) {
      const newOwnPermission = whiteboardData.shared_users
        .find(
          (perm: UserPermission) => perm.type === 'user' && perm.user.id === user.id
        ) || null;

      setSharedUsers(whiteboardData.shared_users);
      
      if (newOwnPermission) {
        setOwnPermission(newOwnPermission.permission);
      }
      else {
        setOwnPermission(null);
      }
    }
  }, [whiteboardData, user])

  const canvasObjectsByCanvas: Record<CanvasIdType, Record<CanvasObjectIdType, CanvasObjectModel>> = useSelector((state: RootState) => (
    selectCanvasObjectsByWhiteboard(state, whiteboardId)
  ));

  console.log("canvasObjects: ", canvasObjectsByCanvas);

  const handleUpdateShapes = useCallback((canvasId: CanvasIdType, shapes: Record<CanvasObjectIdType, Partial<CanvasObjectModel>>) => {
    if (socketRef.current) {
      // find relevant objects and merge the new attributes into the existing
      // attributes
      const canvasObjects: Record<CanvasObjectIdType, CanvasObjectModel> | null = canvasObjectsByCanvas[canvasId] || null;

      if (! canvasObjects) {
        console.error('No canvas objects on canvas id', canvasId);
        return;
      }

      const changedObjects: Record<CanvasObjectIdType, CanvasObjectModel> = {};

      for (const [objId, objUpdate] of Object.entries(shapes)) {
        console.log("updated shape: ", objId, " : ", objUpdate);

        const existingShape = canvasObjects[objId];
        if (!existingShape) continue;

        if (objId in canvasObjects) {
          console.log("updated shape is in canvas objects"); // debug
          changedObjects[objId] = {
            ...canvasObjects[objId],
            ...(objUpdate as Partial<typeof existingShape>),
          } as CanvasObjectModel;
        }
      }// end for (const [objId, objUpdate] of Object.entries(shapes))

      const updateShapesMsg: ClientMessageUpdateShapes = ({
        type: 'update_shapes',
        canvasId,
        shapes: changedObjects
      });

      socketRef.current.send(JSON.stringify(updateShapesMsg));
    }
  }, [canvasObjectsByCanvas]);

  // Current tool choice will be saved to localStorage to ensure seamless UX
  // after page reloads.
  // TODO: save default tool choice ('hand') in a separate config file.
  // const [currentTool, setCurrentTool] = useState<ToolChoice>('hand');
  const LS_CURRENT_TOOL_KEY = 'current_tool';
  const CURRENT_TOOL_DEFAULT : ToolChoice = 'hand'

  const [currentTool, setCurrentTool] = useState<ToolChoice>((): ToolChoice => {
    const savedTool : string | null = localStorage.getItem(LS_CURRENT_TOOL_KEY);

    if (! savedTool) {
      // return default choice
      return CURRENT_TOOL_DEFAULT;
    } else {
      // just trust that the retrieved tool is a valid tool
      return savedTool as ToolChoice;
    }
  });

  // -- make sure to save to localStorage whenever current tool changes
  useEffect(
    () => {
      localStorage.setItem(LS_CURRENT_TOOL_KEY, currentTool);
    },
    [currentTool]
  );

  // -- track refs to canvas groups (frames)
  const canvasGroupRefsByIdRef: RefObject<Record<CanvasIdType, RefObject<Konva.Group | null>>> = useRef({});

  return (
    <WhiteboardProvider
      socketRef={socketRef}
      handleUpdateShapes={handleUpdateShapes}
      currentTool={currentTool}
      setCurrentTool={setCurrentTool}
      whiteboardId={whiteboardId}
      setWhiteboardId={setWhiteboardId}
      sharedUsers={sharedUsers}
      setSharedUsers={setSharedUsers}
      newCanvasAllowedUsers={newCanvasAllowedUsers}
      setNewCanvasAllowedUsers={setNewCanvasAllowedUsers}
      ownPermission={ownPermission}
      setOwnPermission={setOwnPermission}
      selectedShapeIds={selectedShapeIds}
      setSelectedShapeIds={setSelectedShapeIds}
      currentDispatcher={currentDispatcher}
      setCurrentDispatcher={setCurrentDispatcher}
      selectedCanvasId={selectedCanvasId}
      setSelectedCanvasId={setSelectedCanvasId}
      canvasGroupRefsByIdRef={canvasGroupRefsByIdRef}
    >
      <Whiteboard />
    </WhiteboardProvider>
  );
};// end WrappedWhiteboard

export default WrappedWhiteboard;
