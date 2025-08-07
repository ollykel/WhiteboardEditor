// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// =============================================================================

import { Stage, Layer, Rect, Circle, Text } from 'react-konva';

export interface CanvasProps {
  width: number;
  height: number;
}

const Canvas = (props: CanvasProps) => {
  const { width, height } = props;

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Text text="Try to drag shapes" fontSize={15} />
        <Rect
          x={20}
          y={50}
          width={100}
          height={100}
          fill="red"
          shadowBlur={10}
          draggable
        />
        <Circle
          x={200}
          y={100}
          radius={50}
          fill="green"
          draggable
        />
      </Layer>
    </Stage>
  );
};

export default Canvas;
