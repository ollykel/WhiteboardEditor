// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// Makes use of react-konva. For documentation, see
// https://konvajs.org/docs/react/index.html.
//
// =============================================================================

import {
  useRef,
  useContext,
  useState
} from 'react';
import { Stage, Layer, Text } from 'react-konva';
import Konva from 'konva';

// -- local imports
import WhiteboardContext from '@/context/WhiteboardContext';
import type { ToolChoice } from '@/components/Tool';
import {
  type CanvasObjectIdType,
  type CanvasObjectModel
} from '@/types/CanvasObjectModel';
import type {
  CanvasIdType,
} from '@/types/WebSocketProtocol';
import type {
  ShapeAttributesState
} from '@/reducers/shapeAttributesReducer';
import type {
  OperationDispatcher,
} from '@/types/OperationDispatcher';

// -- dispatchers
import useMockDispatcher from '@/dispatchers/useMockDispatcher';
import useInaccessibleDispatcher from '@/dispatchers/useInaccessibleDispatcher';
import useRectangleDispatcher from '@/dispatchers/useRectangleDispatcher';
import useEllipseDispatcher from '@/dispatchers/useEllipseDispatcher';
import useVectorDispatcher from '@/dispatchers/useVectorDispatcher';
import useHandDispatcher from '@/dispatchers/useHandDispatcher';
import useTextDispatcher from '@/dispatchers/useTextDispatcher';

export interface CanvasProps {
  id: CanvasIdType;
  width: number;
  height: number;
  shapes: Record<CanvasObjectIdType, CanvasObjectModel>;
  onAddShapes: (shapes: CanvasObjectModel[]) => void;
  shapeAttributes: ShapeAttributesState;
  currentTool: ToolChoice;
  disabled: boolean;
}

const Canvas = (props: CanvasProps) => {
  const {
    id,
    width,
    height,
    shapes,
    onAddShapes,
    shapeAttributes,
    currentTool,
    disabled
  } = props;

  const [selectedShapeIds, setSelectedShapeIds] = useState<CanvasObjectIdType[]>([]);

  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error('No whiteboard context');
  }

  const {
    handleUpdateShapes,
    ownPermission,
  } = whiteboardContext;
  const stageRef = useRef<Konva.Stage | null>(null);

  const handleObjectUpdateShapes = (shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => {
    handleUpdateShapes(id, shapes);
  };

  // In the future, we may wrap onAddShapes with some other logic.
  // For now, it's just an alias.
  const addShapes = onAddShapes;
  
  const defaultDispatcher = useMockDispatcher({
    shapeAttributes,
    addShapes
  });
  const inaccessibleDispatcher = useInaccessibleDispatcher({
    shapeAttributes,
    addShapes
  });

  const dispatcherMap = {
    'hand': useHandDispatcher({
      shapeAttributes,
      addShapes
    }),
    'rect': useRectangleDispatcher({
      shapeAttributes,
      addShapes
    }),
    'ellipse': useEllipseDispatcher({
      shapeAttributes,
      addShapes
    }),
    'vector': useVectorDispatcher({
      shapeAttributes,
      addShapes
    }),
    'text': useTextDispatcher({
      shapeAttributes,
      addShapes
    })
  };

  let dispatcher: OperationDispatcher;

  if (disabled) {
    dispatcher = inaccessibleDispatcher;
  } else {
    dispatcher = dispatcherMap[currentTool] || defaultDispatcher;
  }

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getPreview,
    getTooltipText
  } = dispatcher;

  // TODO: delegate draggability to tool definitions
  const areShapesDraggable = ((ownPermission !== 'view') && (currentTool === 'hand'));

  const tooltipText = ownPermission === 'view' ? 
    'You are in view-only mode'
    : getTooltipText();

  return (
    <>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onPointerdown={handlePointerDown}
        onPointermove={handlePointerMove}
        onPointerup={handlePointerUp}
        listening={ownPermission !== 'view'}
      >
        <Layer>
          <Text
            text={tooltipText}
            fontSize={15}
          />
          {/** Preview Shape **/}
          {getPreview()}

          {/** Shapes **/}
          {
            Object.entries(shapes).filter(([_id, sh]) => !!sh).map(([id, shape]) => {
              const renderDispatcher = dispatcherMap[shape.type] || defaultDispatcher;
              const { renderShape } = renderDispatcher;

              return renderShape(
                id, 
                shape, 
                areShapesDraggable, 
                handleObjectUpdateShapes,
                selectedShapeIds,
                setSelectedShapeIds,
              );
            })
          }
        </Layer>
      </Stage>
    </>
  );
};

export default Canvas;
