// === ClientMessengerContext ========================================================
//
// Provides a web socket to children of the provider. Must be initialized with
// onopen and onmessage handlers.
//
// =============================================================================

// -- std imports
import {
  createContext,
} from 'react';

// -- local imports
import {
  type IWhiteboardClientMessenger,
} from '@/types/IWhiteboardClientMessenger';

// -- type declarations

export interface ClientMessengerContextType {
  // -- null client messenger indicates inactive messenger
  clientMessenger : IWhiteboardClientMessenger | null;
}// -- end interface ClientMessengerContextType

const ClientMessengerContext = createContext<ClientMessengerContextType | undefined>(undefined);

export {
  ClientMessengerContext,
};
