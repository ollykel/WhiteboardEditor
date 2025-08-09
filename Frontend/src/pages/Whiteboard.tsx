import { useState } from 'react';

import CanvasCard from "@/components/CanvasCard";

type ToolChoice = 'hand' | 'rect' | 'ellipse' | 'vector';

// TODO: Swap out hardcoded placeholders with dynamic data
const tools: ToolChoice[] = ["hand", "vector", "rect", "ellipse"];
const title = "My First Whiteboard";

const getToolChoiceLabel = (toolChoice: ToolChoice): string => {
  switch (toolChoice) {
    case 'hand':
      return 'Hand';
    case 'rect':
      return 'Rectangle';
    case 'vector':
      return 'Vector Tool';
    case 'ellipse':
      return 'Ellipse';
    default:
      return 'UNDEFINED';
  }// end switch (toolChoice)
};

interface ToolbarButtonProps {
  label: string;
  variant: 'default' | 'selected';
  onClick?: () => void;
}

const ToolbarButton = ({ label, variant, onClick }: ToolbarButtonProps): React.JSX.Element => (
  <button
    onClick={onClick}
    className={`p-2 hover:cursor-pointer ${variant === 'selected' && 'bg-gray-400'} hover:bg-gray-200`}
  >
    {label}
  </button>
);

const Whiteboard = () => {
  const [toolChoice, setToolChoice] = useState<ToolChoice>('rect');

  const renderToolChoice = (choice: ToolChoice): React.JSX.Element => (
    <ToolbarButton
      label={getToolChoiceLabel(choice)}
      variant={choice === toolChoice ? 'selected' : 'default'}
      onClick={() => setToolChoice(choice)}
    />
  );

  return (
    <main className="flex flex-col justify-center"> {/* Might not need this to be flex anymore */}
      {/* Header | TODO: separate into Header component */}
      <div className="fixed top-1 left-0 right-0 max-h-15 text-center shadow-md rounded-2xl mx-20 m-1 p-3 bg-stone-50"> 
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 justify-center items-center mt-20"> {/* Might not need this to be flex anymore */}
        {/* Toolbar */}
        <aside className="fixed top-1/2 -translate-y-1/2 left-2 max-w-40 flex flex-col flex-shrink-0 text-center p-4 m-1 rounded-2xl shadow-md  bg-stone-50"> {/* TODO: separate into Sidebar component */}
          <h2 className="text-2xl font-bold mb-4">Tools</h2>
          {tools.map((tool) => renderToolChoice(tool))}

          {/** Additional, non-tool choices **/}
          <ToolbarButton label="Import Image" variant="default" />
          <ToolbarButton label="New Canvas" variant="default" />
        </aside>
        {/* Canvas Container */}
        <div className="flex flex-1 flex-row justify-center flex-wrap ml-40">
          <CanvasCard title="Canvas A"></CanvasCard>
          <CanvasCard title="Canvas B"></CanvasCard>
          <CanvasCard title="Canvas C"></CanvasCard>
          <CanvasCard title="Canvas D"></CanvasCard>
          <CanvasCard title="Canvas E"></CanvasCard>
          <CanvasCard title="Canvas F"></CanvasCard>
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;
