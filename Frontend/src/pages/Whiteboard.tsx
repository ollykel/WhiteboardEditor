import {
  useState,
  useRef,
  useEffect,
  useReducer,
  useContext
} from 'react';

import {
  useParams
} from 'react-router-dom';

import {
  useSelector
} from 'react-redux';

import {
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import { X } from 'lucide-react';

// -- local types
import type {
  Whiteboard as APIWhiteboard,
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
  selectActiveUsers
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

import api from '@/api/axios';

import { useModal } from '@/components/Modal';

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
  CanvasObjectModel
} from '@/types/CanvasObjectModel';
import ShareWhiteboardForm, {
  type ShareWhiteboardFormData
} from '@/components/ShareWhiteboardForm';
import type {
  SocketServerMessage,
  // ClientMessageCreateShapes,
  ClientIdType,
  ClientMessageUpdateShapes,
  ClientMessageCreateCanvas,
  CanvasData,
  CanvasIdType,
  WhiteboardIdType,
  WhiteboardAttribs,
} from '@/types/WebSocketProtocol';

import { useUser } from '@/hooks/useUser';

// -- Allowed Users Redux reducers
// import { 
//   setAllowedUsersByCanvas,
//   addAllowedUsersByCanvas,
//   // removeAllowedUsersByCanvas,
// } from '@/store/allowedUsers/allowedUsersByCanvasSlice';

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
  const queryClient = useQueryClient();
  const { user } = useUser();

  const {
    whiteboard_id: whiteboardId
  } = useParams();

  if (! whiteboardId) {
    throw new Error('No whiteboard id provided');
  }

  if (! context) {
    throw new Error('No WhiteboardContext provided in Whiteboard');
  }

  const {
    socketRef,
    setWhiteboardId
  } = context;

  // -- prop-derived state
  const whiteboardKey = ['whiteboard', whiteboardId];

  // -- managed state
  const {
    isLoading: isWhiteboardLoading,
    isFetching: isWhiteboardFetching,
    error: whiteboardError,
    data: whiteboardData
  } = useQuery<APIWhiteboard, string>({
    queryKey: whiteboardKey,
    queryFn: async (): Promise<APIWhiteboard> => {
      const res = await api.get(`/whiteboards/${whiteboardId}`);

      if (res.status >= 400) {
        throw new Error(res.data?.message || 'whiteboard request failed');
      } else {
        // success
        return res.data;
      }
    }
  });
  const [clientId, setClientId] = useState<ClientIdType>("");
  const [toolChoice, setToolChoice] = useState<ToolChoice>('rect');
  const whiteboardIdRef = useRef<WhiteboardIdType>(whiteboardId);
  console.log("whiteboard data 1: ", whiteboardData); // degbugging

  // alert user of any errors fetching whiteboard
  useEffect(
    () => {
      if (whiteboardError) {
        console.error('Error fetching whiteboard', whiteboardId, ':', whiteboardError);
        alert(`Error fetching whiteboard: ${whiteboardError}`);
      }
    },
    [whiteboardError]
  );

  // dirty trick to keep whiteboardIdRef in-sync with whiteboardId
  useEffect(() => {
    whiteboardIdRef.current = whiteboardId;
  }, [whiteboardId]);

  const [shapeAttributesState, dispatchShapeAttributes] = useReducer(shapeAttributesReducer, {
    x: 0,
    y: 0,
    fillColor: '#999999',
    strokeColor: '#000000',
    strokeWidth: 1
  });

  const activeUsers = useSelector(selectActiveUsers);

  const currWhiteboard: WhiteboardAttribs | null = useSelector((state: RootState) => (
    selectWhiteboardById(state, whiteboardId))
  );

  console.log('Current Whiteboard:', currWhiteboard);

  const canvases: CanvasData[] = useSelector((state: RootState) => {
    console.log('Current State:', state);
    return selectCanvasesWithObjectsByWhiteboardId(state, whiteboardId)
  });

  const canvasesSorted = [...canvases];

  canvasesSorted.sort((a, b) => a.id < b.id ? -1 : 1);

  // TODO: remove debug
  console.log('Canvases:', canvases);

  // --- derived state
  const title = currWhiteboard?.name ?? 'Loading whiteboard ...';
  const isActive = !!socketRef.current;
  const isReady = isActive && (! (isWhiteboardLoading || isWhiteboardFetching));
  const {
    shared_users: sharedUsers
  } = whiteboardData || {};

  // --- misc functions
  const handleNewCanvas = (name: string, allowedUsers: string[]) => {
    // Send message to server.
    // Server will echo response back, and actually inserting the new canvas
    // will be handled by handleServerMessage.
    // TODO: allow setting custom canvas sizes
    if (socketRef.current) {
      const createCanvasMsg : ClientMessageCreateCanvas = ({
        type: 'create_canvas',
        width: 512,
        height: 512,
        name,
        allowedUsers,
      });

      socketRef.current.send(JSON.stringify(createCanvasMsg));
    }
  };

  // Set up web socket connection
  useEffect(() => {
    console.log('Initializing web socket connection ...');
    const dispatch = store.dispatch;
    // TODO: get whiteboard id from path params
    const wsUri = getWebSocketUri(whiteboardId);
    const ws = new WebSocket(wsUri);

    // handles all web socket messages
    const handleServerMessage = (event: MessageEvent): void => {
      console.log('Raw WebSocket message received:', event.data);

      try {
        const msg = JSON.parse(event.data) as SocketServerMessage;
        console.log('Parsed message:', msg);
        console.log('Message type:', msg.type);

        switch (msg.type) {
          case 'init_client':
            {
              const { clientId: initClientId, whiteboard } = msg;

              setWhiteboardId(whiteboard.id);
              setClientId(initClientId);
              addWhiteboard(dispatch, whiteboard);
            }
            break;
          case 'active_users': 
            {
              const { users } = msg;
              console.log('Active users message received:', users);

              addActiveUser(dispatch, users);
            } 
            break;
          case 'create_shapes':
            {
              const { canvasId, shapes } = msg;

              setCanvasObjects(dispatch, whiteboardIdRef.current, canvasId, shapes);
            }
            break;
          case 'update_shapes':
            {
              const { canvasId, shapes } = msg;

              setCanvasObjects(dispatch, whiteboardIdRef.current, canvasId, shapes);
            }
            break;
          case 'create_canvas':
            {
              const { canvasId, width, height, name, allowedUsers = [] } = msg;

              addCanvas(dispatch, whiteboardIdRef.current, ({
                id: canvasId,
                width,
                height,
                name,
                shapes: {},
                allowedUsers
              }));
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
          case 'individual_error':
          case 'broadcast_error':
            {
              const { message } = msg;

              console.error('Socket error:', message);
            }
            break;
          default:
            console.log('Server Message unrecognized:', msg);
        }// end switch (msg.type)
      } catch (e) {
        console.log('Failed to parse message:', e);
      }
    };

    ws.onopen = () => {
      // Send login/auth message with user ID, if currently logged in
      if (user) {
        const loginMessage = {
          type: "login",
          userId: user.id,
          username: user.username,
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

    ws.onmessage = handleServerMessage;

    return () => {
      ws.close();
    }
  }, [socketRef, whiteboardId, setWhiteboardId, user]);

  const makeHandleAddShapes = (canvasId: CanvasIdType) => (shapes: CanvasObjectModel[]) => {
    if (socketRef.current) {
      // TODO: modify backend to take multiple shapes (i.e. create_shapes)
      const createShapesMsg = ({
        type: 'create_shapes',
        canvasId,
        shapes
      });

      socketRef.current.send(JSON.stringify(createShapesMsg));
    }
  };

  // -- Header elements
  const {
    Modal: ShareModal,
    openModal: openShareModal,
    closeModal: closeShareModal
  } = useModal();

  const ShareWhiteboardButton = () => (
    <HeaderButton 
      onClick={() => {
        if (isReady) {
          openShareModal();
        }
      }}
      title="Share"
    /> 
  );

  return (
    <main>
      {/* Header */}
      <HeaderAuthed 
        title={title}
        toolbarElemsLeft={[
          <ShareWhiteboardButton />
        ]}
      />
      {
        /** Display if socket not connected **/
        (! isActive) && (
          <p className="text-lg font-bold text-red-600">
            Connecting ...
          </p>
        )
      }

      {/* Content */}
      <div className="mt-20">
        {/* Left-hand sidebar for toolbar and menus */}
        <Sidebar side="left">
          {/* Toolbar */}
          <Toolbar
            toolChoice={toolChoice}
            onToolChange={setToolChoice}
            onNewCanvas={handleNewCanvas}
          />

          {/** Shape Attributes Menu **/}
          <ShapeAttributesMenu
            attributes={shapeAttributesState}
            dispatch={dispatchShapeAttributes}
          />
        </Sidebar>


        {/* Canvas Container */}
        <div className="flex flex-col justify-center flex-wrap ml-50">
          {/** Misc. info **/}

          <div className="flex flex-col justify-center flex-wrap">
            {/** Own Client ID **/}
            <div>
              <span>Your Username: </span> {user?.username}
            </div>

            {/* Display Active Clients */}
            <div>
              <span>Active Users: </span>
              { Object.values(activeUsers).join(', ') }
            </div>
          </div>

          {/* Display Canvases */}
          <div className="flex flex-1 flex-row justify-center flex-wrap">
            {canvasesSorted.map(({ id: canvasId, width, height, name, shapes, allowedUsers }: CanvasData) => {
              const hasAccess = allowedUsers.length === 0 || allowedUsers.includes(clientId);
              return (
                <CanvasCard
                  id={canvasId}
                  key={canvasId}
                  title={name}
                  width={width}
                  height={height}
                  shapes={shapes}
                  onAddShapes={makeHandleAddShapes(canvasId)}
                  shapeAttributes={shapeAttributesState}
                  currentTool={toolChoice}
                  disabled={!hasAccess}
                  whiteboardId={whiteboardId}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/** Modal that opens to share the whiteboard **/}
      <ShareModal width="50em" height="20em" zIndex={100}>
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

                const res = await api.post(`/whiteboards/${whiteboardId}/share`, ({
                  userPermissions
                }));

                if (res.status >= 400) {
                  console.error('POST /whiteboards/:id/share failed:', res.data);
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
    </main>
  );
};// end Whiteboard

const WrappedWhiteboard = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [whiteboardId, setWhiteboardId] = useState<WhiteboardIdType>("");

  const { data: whiteboardData, isLoading: isWhiteboardDataLoading } = useQuery({
    queryKey: ['whiteboard', whiteboardId],
    enabled: !!whiteboardId, // Only run query when whiteboardId exists
    queryFn: async () => {
      if (!whiteboardId) throw new Error('No whiteboard ID provided');
      console.log('Fetching whiteboard data for ID:', whiteboardId);
      const res = await api.get(`/whiteboards/${whiteboardId}`);
      if (res.status >= 400) throw new Error(res.data?.message || 'Failed');
      console.log('API Response:', res.data);
      return res.data;
    },
  });
  console.log("Current whiteboard data:", whiteboardData);
  console.log("Loading status:", isWhiteboardDataLoading);

  // update the state of sharedUsers whenever whiteboardData changes
  const [sharedUsers, setSharedUsers] = useState<APIWhiteboard['shared_users']>([]);
  console.log("Current shared users:", sharedUsers);

  useEffect(() => {
    if (whiteboardData?.shared_users) {
      setSharedUsers(whiteboardData.shared_users);
    }
  }, [whiteboardData])

  const canvasObjectsByCanvas: Record<CanvasIdType, Record<CanvasObjectIdType, CanvasObjectModel>> = useSelector((state: RootState) => (
    selectCanvasObjectsByWhiteboard(state, whiteboardId)
  ));

  const handleUpdateShapes = (canvasId: CanvasIdType, shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => {
    if (socketRef.current) {
      // find relevant objects and merge the new attributes into the existing
      // attributes
      const canvasObjects: Record<CanvasObjectIdType, CanvasObjectModel> | null = canvasObjectsByCanvas[canvasId] || null;

      if (! canvasObjects) {
        console.error('No canvas objects on canvas id', canvasId);
        return;
      }

      const changedObjects: Record<CanvasObjectIdType, CanvasObjectModel> = {};

      for (const [objIdStr, objUpdate] of Object.entries(shapes)) {
        const objId = parseInt(objIdStr);

        if (objId in canvasObjects) {
          changedObjects[objId] = ({
            ...canvasObjects[objId],
            ...objUpdate
          });
        }
      }// end for (const [objId, objUpdate] of Object.entries(shapes))

      const createShapesMsg: ClientMessageUpdateShapes = ({
        type: 'update_shapes',
        canvasId,
        shapes: changedObjects
      });

      socketRef.current.send(JSON.stringify(createShapesMsg));
    }
  };

  const [currentTool, setCurrentTool] = useState<ToolChoice>('hand');

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
    >
      <Whiteboard />
    </WhiteboardProvider>
  );
};// end WrappedWhiteboard

export default WrappedWhiteboard;
