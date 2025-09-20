import React, {
  createContext,
  type PropsWithChildren,
  type RefObject
} from 'react';

import type {
  ToolChoice
} from '@/components/Tool';

import type {
  CanvasObjectIdType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

import type {
  CanvasIdType,
  WhiteboardIdType,
} from '@/types/WebSocketProtocol';

import type {
  UserPermission,
  User,
} from '@/types/APIProtocol'

export interface WhiteboardContextType {
  socketRef: RefObject<WebSocket | null>;
  handleUpdateShapes: (canvasId: CanvasIdType, shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => void;
  currentTool: ToolChoice;
  setCurrentTool: React.Dispatch<React.SetStateAction<ToolChoice>>;
  whiteboardId: WhiteboardIdType;
  setWhiteboardId: React.Dispatch<React.SetStateAction<WhiteboardIdType>>;
  sharedUsers: UserPermission[];
  setSharedUsers: React.Dispatch<React.SetStateAction<UserPermission[]>>;
  newCanvasAllowedUsers: User[];
  setNewCanvasAllowedUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export type WhiteboardProvidersProps = WhiteboardContextType;

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

const WhiteboardProvider = (props: PropsWithChildren<WhiteboardProvidersProps>): React.JSX.Element => {
  const {
    socketRef,
    handleUpdateShapes,
    currentTool,
    setCurrentTool,
    whiteboardId,
    setWhiteboardId,
    children,
    sharedUsers,
    setSharedUsers,
    newCanvasAllowedUsers,
    setNewCanvasAllowedUsers,

  } = props;

  return (
    <WhiteboardContext.Provider value={{
      socketRef,
      handleUpdateShapes,
      currentTool,
      setCurrentTool,
      whiteboardId,
      setWhiteboardId,
      sharedUsers,
      setSharedUsers,
      newCanvasAllowedUsers,
      setNewCanvasAllowedUsers,
    }}>
      {children}
    </WhiteboardContext.Provider>
  );
}

export {
  WhiteboardProvider
};

export default WhiteboardContext;
