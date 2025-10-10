import {
  Stage,
  Layer,
} from 'react-konva';

import Canvas from "./Canvas";
import CanvasMenu from "./CanvasMenu";

import type { CanvasProps } from '@/components/Canvas';
import type { WhiteboardIdType } from "@/types/WebSocketProtocol";

interface CanvasCardProps extends CanvasProps {
  title: string;
  whiteboardId: WhiteboardIdType;
}

function CanvasCard(props: CanvasCardProps) {
  const {
    id,
    title,
    whiteboardId,
    width,
    height,
  } = props;

  return (
    <div className="flex flex-col p-6">
      {/* Title */}
      <div className="text-center p-4">
        {title}
      </div>

      {/* Konva Canvas */}
      <div className="border border-black">
        <Stage
          width={width}
          height={height}
        >
          <Layer>
            {/** Sub-canvases will be rendered recursively by Canvas component **/}
            <Canvas
              {...props}
            />
          </Layer>
        </Stage>
      </div>
      {/* Canvas Menu */}
      <CanvasMenu 
        canvasId={id}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}

export default CanvasCard;
