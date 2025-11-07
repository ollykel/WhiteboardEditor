import React, {
  useContext,
} from 'react';

import WhiteboardContext from '@/context/WhiteboardContext';

import { getToolChoiceLabel } from '@/components/Tool';

import type { ToolChoice } from '@/components/Tool';

import type { LucideIcon } from 'lucide-react';

interface ToolbarProps {
  toolChoice: ToolChoice;
  onToolChange: (choice: ToolChoice) => void;
}

interface ToolbarButtonProps {
  label: LucideIcon;
  variant: 'default' | 'selected';
  onClick?: () => void;

}
const tools: ToolChoice[] = [
  "hand",
  "vector",
  "rect",
  "ellipse",
  "text",
  "create_canvas",
];

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ label, variant, onClick }, ref) => {
    const Icon = label;
    
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`p-2 place-items-center rounded-xl hover:cursor-pointer ${variant === 'selected' && 'bg-gray-400'} hover:bg-gray-200`}
      >
        <Icon />
      </button>
    )
  }
);

function Toolbar({ toolChoice, onToolChange }: ToolbarProps) {
  
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error('No WhiteboardContext provided');
  }

  const renderToolChoice = (choice: ToolChoice): React.JSX.Element => (
    <ToolbarButton
      label={getToolChoiceLabel(choice)}
      variant={choice === toolChoice ? 'selected' : 'default'}
      onClick={() => onToolChange(choice)}
    />
  );

  return (
    <div className="max-w-40 flex flex-col flex-shrink-0 text-center p-2 rounded-lg shadow-md bg-stone-50">
      <h2 className="text-lg font-bold mb-1">Tools</h2>
      {tools.map((tool) => renderToolChoice(tool))}

      {/** Additional, non-tool choices **/}

      {/** Import Image Button - Future implementation **/}
      {/* <ToolbarButton
        label="Import Image"
        variant="default"
      /> */}
    </div>
  )
}

export default Toolbar;
