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
  width: number;
  height: number;
}

interface EventCoords {
  x: number;
  y: number;
}

const Canvas = (props: CanvasProps) => {
  const { width, height, currentTool } = props;
  const stageRef = useRef<any>(null);
  // for generating unique ids
  const rectCountRef = useRef<number>(0);
  const [rectangles, setRectangles] = useState<RectProps[]>([]);
  const [mouseDownCoords, setMouseDownCoords] = useState<EventCoords | null>(null);
  const [mouseCoords, setMouseCoords] = useState<EventCoords | null>(null);

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

  const addRectangle = (x: number, y: number, wi: number, ht: number) => {
    const rectCount = rectCountRef.current;

    setRectangles((orig) => [
      ...orig,
      ({
        id: rectCount,
        x, y,
        width: wi,
        height: ht
      })
    ]);

    rectCountRef.current += 1;
  };

  const handleMouseMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { offsetX, offsetY } = ev.evt;

    setMouseCoords({ x: offsetX, y: offsetY });
  };

  const handleMouseDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { offsetX, offsetY } = ev.evt;

    setMouseDownCoords({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { offsetX: xA, offsetY: yA } = ev.evt;

    if (mouseDownCoords !== null) {
      const { x: xB, y: yB } = mouseDownCoords;
      const xMin = Math.min(xA, xB);
      const yMin = Math.min(yA, yB);
      const width = Math.abs(xA - xB);
      const height = Math.abs(yA - yB);

      addRectangle(xMin, yMin, width, height);
    }

    setMouseDownCoords(null);
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        <Text
          text={tooltipText}
          fontSize={15}
        />
        {/** Preview Rectangle **/}
        {
          mouseCoords && mouseDownCoords && (
              <Rect
                x={Math.min(mouseCoords.x, mouseDownCoords.x)}
                y={Math.min(mouseCoords.y, mouseDownCoords.y)}
                width={Math.abs(mouseCoords.x - mouseDownCoords.x)}
                height={Math.abs(mouseCoords.y - mouseDownCoords.y)}
                fill="#ffaaaa"
              />
          )
        }

        {/** Rectangles **/}
        {
          rectangles.map((props: RectProps) => {
            const { id, x, y, width, height } = props;
            
            return (
              <Rect
                key={id}
                x={x}
                y={y}
                width={width}
                height={height}
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
