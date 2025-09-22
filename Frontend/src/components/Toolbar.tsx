import React, { useContext, useState } from 'react';

import WhiteboardContext from '@/context/WhiteboardContext';

import { getToolChoiceLabel } from '@/components/Tool';
import PopoverMenu from '@/components/PopoverMenu'
import CreateCanvasMenu, { type NewCanvas } from '@/components/CreateCanvasMenu'

import type { ToolChoice } from '@/components/Tool';

interface ToolbarProps {
  toolChoice: ToolChoice;
  onToolChange: (choice: ToolChoice) => void;
  onNewCanvas: (canvas: NewCanvas) => void;
}

interface ToolbarButtonProps {
  label: string;
  variant: 'default' | 'selected';
  onClick?: () => void;

}
const tools: ToolChoice[] = ["hand", "vector", "rect", "ellipse"];

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ label, variant, onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`p-2 rounded-xl hover:cursor-pointer ${variant === 'selected' && 'bg-gray-400'} hover:bg-gray-200`}
    >
      {label}
    </button>
  )
);

function Toolbar({ toolChoice, onToolChange, onNewCanvas }: ToolbarProps) {
  const [newCanvasOpen, setNewCanvasOpen] = useState(false);
  
  const context = useContext(WhiteboardContext);
  console.log("toolbar context: ", context); // degbugging
  if (!context) {
    throw new Error('No WhiteboardContext provided');
  }
  const sharedUsers = context.sharedUsers;
  console.log("toolbar sharedUsers: ", sharedUsers); // degbugging

  const renderToolChoice = (choice: ToolChoice): React.JSX.Element => (
    <ToolbarButton
      label={getToolChoiceLabel(choice)}
      variant={choice === toolChoice ? 'selected' : 'default'}
      onClick={() => onToolChange(choice)}
    />
  );

  return (
    <div className="max-w-40 flex flex-col flex-shrink-0 text-center p-4 m-1 rounded-2xl shadow-md  bg-stone-50">
      <h2 className="text-2xl font-bold mb-4">Tools</h2>
      {tools.map((tool) => renderToolChoice(tool))}

      {/** Additional, non-tool choices **/}
      <ToolbarButton label="Import Image" variant="default" />
      <PopoverMenu
        open={newCanvasOpen}
        onOpenChange={setNewCanvasOpen}
        trigger={<ToolbarButton label="New Canvas" variant="default" />}
      >
        <CreateCanvasMenu 
          onCreate={(canvas) => {
            onNewCanvas(canvas);
            setNewCanvasOpen(false); // close popover after creating
          }}
        />
      </PopoverMenu>
    </div>
  )
}

export default Toolbar;
