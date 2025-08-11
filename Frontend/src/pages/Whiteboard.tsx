import { useState, useRef, useEffect } from 'react';

import CanvasCard from "@/components/CanvasCard";
import Toolbar from "@/components/Toolbar";
import Header from '@/components/Header';

import type { ToolChoice } from '@/components/Tool';
import type { SocketMessage } from '@/types/WebSocketProtocol';

// TODO: Swap out hardcoded placeholders with dynamic data
const title = "My First Whiteboard";

const getWebSocketUri = (): string => {
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUri = `${wsScheme}://${window.location.host}/ws`;

    return wsUri;
};

const Whiteboard = () => {
  const [toolChoice, setToolChoice] = useState<ToolChoice>('rect');
  const [canvases, setCanvases] = useState<{ id: number, title: string }[]>([{ id: 1, title: "Canvas A" }]);
  const socketRef = useRef<WebSocket | null>(null);

  // handles all web socket messages
  const handleMessage = (event: any): void => {
    try {
      const msg = JSON.parse(event.data) as SocketMessage;
      console.log('Received:', msg);

      // TODO: handle each type of message
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

  const nextID = useRef(2);
  const nextCanvasTitle = useRef(66);

  const handleNewCanvas = () => {
    const titleChar = String.fromCharCode(nextCanvasTitle.current);
    nextCanvasTitle.current += 1;

    const idNum = nextID.current;
    nextID.current += 1;

    setCanvases(prev => [
      ...prev,
      {
        id: idNum,
        title: `Canvas ${titleChar}`,
      }
    ]);
  }

  return (
    <main>
      {/* Header */}
      <Header 
        title={title}
      />
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
          {canvases.map((canvas) => (
            <CanvasCard
              key={canvas.id}
              title={canvas.title}
              width={512}
              height={512}
              currentTool={toolChoice}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;
