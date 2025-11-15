// === WebSocketContext ========================================================
//
// Provides a web socket to children of the provider. Must be initialized with
// onopen and onmessage handlers.
//
// =============================================================================

// -- std imports
import {
  useRef,
  createContext,
  type RefObject,
  type PropsWithChildren,
} from 'react';

export interface WebSocketContextType {
  webSocketRef: RefObject<WebSocket>;
}// -- end interface WebSocketContextType

export interface WebSocketProviderProps {
  uri: string;
  onOpen: () => unknown;
  onMessage: (msg: object) => unknown;
}// -- end interface WebSocketProviderProps

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WebSocketProvider = ({
  uri,
  onOpen,
  onMessage,
  children,
}: PropsWithChildren<WebSocketProviderProps>): React.ReactNode => {
  const webSocketRef = useRef<WebSocket>(new WebSocket(uri));

  webSocketRef.current.onopen = onOpen;
  webSocketRef.current.onmessage = onMessage;

  return (
    <WebSocketContext.Provider value={{ webSocketRef }}>
      {children}
    </WebSocketContext.Provider>
  );
};// -- end WebSocketProvider

export {
  WebSocketContext,
  WebSocketProvider,
};
