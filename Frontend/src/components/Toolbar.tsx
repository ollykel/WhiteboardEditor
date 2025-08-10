import { getToolChoiceLabel } from '@/components/Tool';

import type { ToolChoice } from '@/components/Tool';

interface ToolbarProps {
  toolChoice: ToolChoice;
  onToolChange: (choice: ToolChoice) => void;
  onNewCanvas: () => void;
}

interface ToolbarButtonProps {
  label: string;
  variant: 'default' | 'selected';
  onClick?: () => void;

}
const tools: ToolChoice[] = ["hand", "vector", "rect", "ellipse"];

const ToolbarButton = ({ label, variant, onClick }: ToolbarButtonProps): React.JSX.Element => (
  <button
    onClick={onClick}
    className={`p-2 hover:cursor-pointer ${variant === 'selected' && 'bg-gray-400'} hover:bg-gray-200`}
  >
    {label}
  </button>
);

function Toolbar({ toolChoice, onToolChange, onNewCanvas }: ToolbarProps) {
  const renderToolChoice = (choice: ToolChoice): React.JSX.Element => (
    <ToolbarButton
      label={getToolChoiceLabel(choice)}
      variant={choice === toolChoice ? 'selected' : 'default'}
      onClick={() => onToolChange(choice)}
    />
  );

  return (
    <aside className="fixed top-1/2 -translate-y-1/2 left-2 max-w-40 flex flex-col flex-shrink-0 text-center p-4 m-1 rounded-2xl shadow-md  bg-stone-50">
      <h2 className="text-2xl font-bold mb-4">Tools</h2>
      {tools.map((tool) => renderToolChoice(tool))}

      {/** Additional, non-tool choices **/}
      <ToolbarButton label="Import Image" variant="default" />
      <ToolbarButton label="New Canvas" variant="default" onClick={onNewCanvas} />
    </aside>
  )
}

export default Toolbar;