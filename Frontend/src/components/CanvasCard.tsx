import Canvas from "./Canvas";

import type { CanvasProps } from '@/components/Canvas';

interface CanvasCardProps extends CanvasProps {
  title: string;
}

function CanvasCard({ title, width, height, currentTool, accessible }: CanvasCardProps) {
  return (
    <div className="flex flex-col p-6">
      {/* Active Users */}
      <div className="text-center">Active Users: </div>
      {/* Title */}
      <div className="text-center p-4">{title}</div>
      {/* Konva Canvas */}
      <div className="border border-black">
        <Canvas
          width={width}
          height={height}
          currentTool={currentTool}
          accessible={accessible}
        />
      </div>
      {/* Currently Drawing */}
      <div className="currently-drawing">Joe is drawing...</div>
    </div>
  );
}

export default CanvasCard;
