// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// Makes use of react-konva. For documentation, see
// https://konvajs.org/docs/react/index.html.
//
// =============================================================================

import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

export interface CanvasProps {
  width: number;
  height: number;
}

// For starters, just assume all rectangles have uniform width, height, and
// color.
interface RectProps {
  id: number;
  x: number;
  y: number;
}

const Canvas = (props: CanvasProps) => {
  const { width, height } = props;
  const stageRef = useRef<any>(null);
  // for generating unique ids
  const rectCountRef = useRef<number>(0);
  const [rectangles, setRectangles] = useState<RectProps[]>([]);

  const addRectangle = (x: number, y: number) => {
    const rectCount = rectCountRef.current;

    setRectangles((orig) => [
      ...orig,
      { id: rectCount, x, y }
    ]);

    rectCountRef.current += 1;
  };

  const handleStageClick = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { offsetX, offsetY } = ev.evt;

    addRectangle(offsetX, offsetY);
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onMouseDown={handleStageClick}
    >
      <Layer>
        <Text text="Click to insert rectangles" fontSize={15} />
        {
          rectangles.map((props: RectProps) => {
            const { id, x, y } = props;
            
            return (
              <Rect
                key={id}
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
