import { useState, useRef, useEffect } from 'react';

import CanvasCard from "@/components/CanvasCard";
import Toolbar from "@/components/Toolbar";
import Header from '@/components/Header';

import type { ToolChoice } from '@/components/Tool';
import type { ShapeModel } from '@/types/ShapeModel';
import type {
  SocketMessage,
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
  const [title, setTitle] = useState<string>('Loading Whiteboard ...');
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [activeClients, setActiveClients] = useState<Set<number>>(new Set());
  const [clientId, setClientId] = useState<number>(-1);
  const [toolChoice, setToolChoice] = useState<ToolChoice>('rect');

  // --- derived state
  const isActive = socketRef.current !== null;

  // handles all web socket messages
  const handleMessage = (event: any): void => {
    try {
      const msg = JSON.parse(event.data) as SocketMessage;
      console.log('Received:', msg);

      // TODO: handle each type of message
      switch (msg.type) {
        case 'init_client':
          {
            const { clientId: initClientId, activeClients: initActiveClients, whiteboard } = msg;
            const { name, canvases: initCanvases } = whiteboard;

            setTitle(name);
            setClientId(initClientId);
            setActiveClients(new Set(initActiveClients));
            setCanvases(initCanvases);
          }
          break;
        case 'client_login':
          {
            const { clientId } = msg;

            setActiveClients((prev) => {
              const next = new Set(prev.keys());

              next.add(clientId);
              return next;
            });
          }
          break;
        case 'client_logout':
          {
            const { clientId } = msg;

            setActiveClients((prev) => {
              const next = new Set(prev.keys());

              next.delete(clientId);
              return next;
            });
          }
          break;
        case 'create_shape':
          {
            const { canvasId, shape } = msg;

            // TODO: account for canvasId possibly not being an index
            setCanvases((prev) => {
              const targetCanvas = prev[canvasId];
              const { shapes: prevShapes } = targetCanvas;

              return [
                ...prev.slice(0, canvasId),
                ({
                  ...targetCanvas,
                  shapes: [...prevShapes, shape]
                }),
                ...prev.slice(canvasId + 1)
              ];
            });
          }
          break;
        case 'create_canvas':
          {
            const { canvasId, width, height } = msg;

            // Just push it to the end for now
            setCanvases((prev) => [
              ...prev,
              ({ id: canvasId, width, height, shapes: [] })
            ]);
          }
          break;
        default:
          console.log('Message type unrecognized');
      }// end switch (msg.type)
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
    };
    ws.onerror = () => {
      console.log(`Failed to establish web socket connection to ${wsUri}`);
      socketRef.current = null;
    };
    ws.onmessage = handleMessage;
  }, []);

  const handleNewCanvas = () => {
    // Send message to server.
    // Server will echo response back, and actually inserting the new canvas
    // will be handled by handleMessage.
    // TODO: allow setting custom canvas sizes
    if (socketRef.current) {
      // TODO: more permanent solution by creating separate client and server
      // messages for creating canvases
      socketRef.current.send(JSON.stringify({
        type: 'create_canvas',
        clientId: -1,
        canvasId: -1,
        width: 512,
        height: 512
      }));
    }
  };

  const makeHandleAddShapes = (canvasId: CanvasIdType) => (shapes: ShapeModel[]) => {
    if (socketRef.current) {
      // TODO: modify backend to take multiple shapes (i.e. create_shapes)
      for (const shape of shapes) {
        console.log('Adding shape:', shape);
        socketRef.current.send(JSON.stringify({
          type: 'create_shape',
          clientId,
          canvasId,
          shape
        }));
      }// end for (shape of shapes)
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
        <div className="flex flex-1 flex-row justify-center flex-wrap ml-40">
          {/* Display Active Clients */}
          <div>
            <span>Active user IDs: </span>
            { [...activeClients.keys()].join(', ') }
          </div>

          {canvases.map(({ id: canvasId, width, height, shapes }: CanvasData) => (
            <CanvasCard
              key={canvasId}
              title={"TODO: store titles"}
              width={width}
              height={height}
              shapes={shapes}
              onAddShapes={makeHandleAddShapes(canvasId)}
              currentTool={toolChoice}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;
