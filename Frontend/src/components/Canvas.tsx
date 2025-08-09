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

// -- local imports
import type { ToolChoice } from '@/components/Tool';

export interface CanvasProps {
  width: number;
  height: number;
  currentTool: ToolChoice;
}

// For starters, just assume all rectangles have uniform width, height, and
// color.
interface RectProps {
  id: number;
  x: number;
  y: number;
}

const Canvas = (props: CanvasProps) => {
  const { width, height, currentTool } = props;
  const stageRef = useRef<any>(null);
  // for generating unique ids
  const rectCountRef = useRef<number>(0);
  const [rectangles, setRectangles] = useState<RectProps[]>([]);

  const tooltipText = (() => {
    switch (currentTool) {
      case 'hand':
        return 'Click and drag to move objects (TODO: IMPLEMENT)';
      case 'rect':
        return 'Click to insert rectangles';
      case 'ellipse':
        return 'Click to insert ellipses (TODO: IMPLEMENT)';
      case 'vector':
        return 'Click to draw vector-based polygons (TODO: IMPLEMENT)';
    }// end switch (currentTool)
  })();

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
        <Text
          text={tooltipText}
          fontSize={15}
        />
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
