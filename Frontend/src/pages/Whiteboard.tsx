import { useState, useRef, useEffect } from 'react';

import CanvasCard from "@/components/CanvasCard";
import Toolbar from "@/components/Toolbar";
import Header from '@/components/Header';
import { useUser } from '@/hooks/useUser';
import type { ToolChoice } from '@/components/Tool';
import type { ShapeModel } from '@/types/ShapeModel';
import type {
  SocketServerMessage,
  ClientMessageCreateShapes,
  ClientMessageCreateCanvas,
  CanvasData,
  CanvasIdType
} from '@/types/WebSocketProtocol';

const getWebSocketUri = (): string => {
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUri = `${wsScheme}://${window.location.host}/ws`;

    return wsUri;
};

const Whiteboard = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const { user } = useUser();
  const [title, setTitle] = useState<string>('Loading Whiteboard ...');
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [username, setUsername] = useState<string>('');
  const [toolChoice, setToolChoice] = useState<ToolChoice>('rect');

  // --- derived state
  const isActive = socketRef.current !== null

  // handles all web socket messages
  const handleServerMessage = (event: MessageEvent): void => {
    try {
      const msg = JSON.parse(event.data) as SocketServerMessage;
      console.log('Received:', msg);

      switch (msg.type) {
        case 'init_client': {
          const { username: myUsername, activeUsers: initActiveUsers, whiteboard } = msg;
          const { name, canvases: initCanvases } = whiteboard;
          setTitle(name);
          setUsername(myUsername);
          setActiveUsers(new Set(initActiveUsers));
          setCanvases(initCanvases);
        } break;
        case 'active_users_update': {
          const { activeUsers } = msg;
          setActiveUsers(new Set(activeUsers));
        } break;
        case 'client_login': {
          // No longer needed for updating activeUsers, but can be used for notifications
        } break;
        case 'client_logout': {
          // No longer needed for updating activeUsers, but can be used for notifications
        } break;
        case 'create_shapes': {
          const { canvasId, shapes } = msg;
          setCanvases((prev) => {
            const idx = prev.findIndex(c => c.id === canvasId);
            if (idx === -1) return prev;
            const targetCanvas = prev[idx];
            const { shapes: prevShapes } = targetCanvas;
            return [
              ...prev.slice(0, idx),
              ({
                ...targetCanvas,
                shapes: [...prevShapes, ...shapes]
              }),
              ...prev.slice(idx + 1)
            ];
          });
        } break;
        case 'create_canvas': {
          const { canvasId, width, height, allowedUsers = [] } = msg;
          setCanvases((prev) => [
            ...prev,
            ({ id: canvasId, width, height, shapes: [], allowedUsers })
          ]);
        } break;
        default:
          console.log('Server Message type unrecognized');
      }
    } catch (e) {
      console.log('Failed to parse message:', e);
    }
  };

  // Set up web socket connection
  useEffect(() => {
    const wsUri = getWebSocketUri();
    const ws = new WebSocket(wsUri);

    ws.onopen = () => {
      console.log(`Established web socket connection to ${wsUri}`);
      socketRef.current = ws;
      // Send Register message with username
      if (user?.username) {
        ws.send(JSON.stringify({ type: 'register', username: user.username }));
      }
    };
    ws.onerror = () => {
      console.log(`Failed to establish web socket connection to ${wsUri}`);
      socketRef.current = null;
    };
    ws.onmessage = handleServerMessage;
    // Cleanup on unmount
    return () => {
      ws.close();
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  const handleNewCanvas = () => {
    // Send message to server.
    // Server will echo response back, and actually inserting the new canvas
    // will be handled by handleServerMessage.
    // TODO: allow setting custom canvas sizes
    if (socketRef.current) {
      // TODO: more permanent solution by creating separate client and server
      // messages for creating canvases
      const createCanvasMsg : ClientMessageCreateCanvas = ({
        type: 'create_canvas',
        width: 512,
        height: 512
      });

      socketRef.current.send(JSON.stringify(createCanvasMsg));
    }
  };

  const makeHandleAddShapes = (canvasId: CanvasIdType) => (shapes: ShapeModel[]) => {
    if (socketRef.current) {
      // TODO: modify backend to take multiple shapes (i.e. create_shapes)
      const createShapesMsg: ClientMessageCreateShapes = ({
        type: 'create_shapes',
        canvasId,
        shapes
      });

      socketRef.current.send(JSON.stringify(createShapesMsg));
    }
  };

  return (
    <main>
      {/* Header */}
      <Header 
        title={title}
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
        {/* Toolbar */}
        <Toolbar
          toolChoice={toolChoice}
          onToolChange={setToolChoice}
          onNewCanvas={handleNewCanvas}
        />

        {/* Canvas Container */}
        <div className="flex flex-col justify-center flex-wrap ml-40">
          {/** Misc. info **/}

          <div className="flex flex-col justify-center flex-wrap">
            <div>
              <span>Username: </span> {user?.username}
            </div>
            <div>
              <span>Active users: </span>
              {[...activeUsers].join(', ')}
            </div>
          </div>

          <div className="flex flex-1 flex-row justify-center flex-wrap">
            {canvases.map(({ id: canvasId, width, height, shapes, allowedUsers }: CanvasData) => {
              const hasAccess = allowedUsers.length === 0 || allowedUsers.includes(username);
              return (
                <CanvasCard
                  key={canvasId}
                  title={"TODO: store titles"}
                  width={width}
                  height={height}
                  shapes={shapes}
                  onAddShapes={makeHandleAddShapes(canvasId)}
                  currentTool={toolChoice}
                  disabled={!hasAccess}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;
