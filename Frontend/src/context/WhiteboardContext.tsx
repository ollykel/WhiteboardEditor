import React, {
  createContext,
  type PropsWithChildren
} from 'react';
import type {
  ToolChoice
} from '@/components/Tool';

export interface WhiteboardContextType {
  currentTool: ToolChoice;
  setCurrentTool: React.Dispatch<React.SetStateAction<ToolChoice>>;
}

export type WhiteboardProvidersProps = WhiteboardContextType;

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

const WhiteboardProvider = (props: PropsWithChildren<WhiteboardProvidersProps>): React.JSX.Element => {
  const { currentTool, setCurrentTool, children } = props;

  return (
    <WhiteboardContext.Provider value={{ currentTool, setCurrentTool }}>
      {children}
    </WhiteboardContext.Provider>
  );
}

export {
  WhiteboardProvider
};

export default WhiteboardContext;
