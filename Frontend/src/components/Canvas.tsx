// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// =============================================================================

import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';

export interface CanvasProps {
  width: number;
  height: number;
}

// For starters, just assume all rectangles have uniform width, height, and
// color.
interface RectProps {
  x: number;
  y: number;
}

const Canvas = (props: CanvasProps) => {
  const { width, height } = props;
  const stageRef = useRef<returntype<Stage> | null>(null);
  const [rectangles, setRectangles] = useState<RectProps[]>([]);

  const addRectangle = (x: number, y: number) => {
    setRectangles((orig) => [
      ...orig,
      { x, y }
    ]);
  };

  const handleStageClick = (ev: React.MouseEvent<React.HTMLElement>) => {
    const { offsetX, offsetY } = ev.evt;

    addRectangle(offsetX, offsetY);
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={handleStageClick}
    >
      <Layer>
        <Text text="Click to insert rectangles" fontSize={15} />
        {
          rectangles.map((props: RectProps) => {
            const { x, y } = props;
            
            return (
              <Rect
                x={x}
                y={y}
                width={50}
                height={50}
                fill="red"
                shadowBlur={10}
              />
            );
          })
        }
      </Layer>
    </Stage>
  );
};

export default Canvas;
