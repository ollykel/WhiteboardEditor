import React from 'react';

import { getToolChoiceLabel } from '@/components/Tool';
import PopoverMenu from '@/components/PopoverMenu'
import CreateCanvasMenu from '@/components/CreateCanvasMenu'
import type { ToolChoice } from '@/components/Tool';

interface ToolbarProps {
  toolChoice: ToolChoice;
  onToolChange: (choice: ToolChoice) => void;
  onNewCanvas: (name: string, allowedUsers: string[]) => void;
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

const sharedUsers = ["joe", "oliver"];

function Toolbar({ toolChoice, onToolChange, onNewCanvas }: ToolbarProps) {
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
        trigger={<ToolbarButton label="New Canvas" variant="default" />}
      >
        {/* TODO: Get actual allUsers list from dynamic stored state */}
        <CreateCanvasMenu onCreate={onNewCanvas} sharedUsers={sharedUsers}/>
      </PopoverMenu>
    </div>
  )
}

export default Toolbar;
