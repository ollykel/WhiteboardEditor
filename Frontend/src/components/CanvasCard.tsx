import Canvas from "./Canvas";
import CanvasMenu from "./CanvasMenu";

import type { CanvasProps } from '@/components/Canvas';

interface CanvasCardProps extends CanvasProps {
  title: string;
}

function CanvasCard(props: CanvasCardProps) {
  const { title } = props;

  return (
    <div className="flex flex-col p-6">
      {/* Active Users */}
      <div className="text-center">Active Users: </div>
      {/* Title */}
      <div className="text-center p-4">{title}</div>
      {/* Konva Canvas */}
      <div className="border border-black">
        <Canvas {...props} />
      </div>
      {/* Currently Drawing */}
      <div className="currently-drawing">Joe is drawing...</div>
      {/* Canvas Menu */}
      <CanvasMenu></CanvasMenu>
    </div>
  );
}

export default CanvasCard;
