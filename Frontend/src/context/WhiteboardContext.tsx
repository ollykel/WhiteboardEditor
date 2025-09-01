import React, {
  useState,
  createContext,
  type ReactNode
} from 'react';
import type {
  ToolChoice
} from '@/components/Tool';

export interface WhiteboardContextType {
  currentTool: ToolChoice;
  setCurrentTool: React.Dispatch<React.SetStateAction<ToolChoice>>;
}

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

const WhiteboardProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [currentTool, setCurrentTool] = useState<ToolChoice>('hand');

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
