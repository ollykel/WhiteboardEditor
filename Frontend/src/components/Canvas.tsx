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
  type Dispatch,
} from 'react';
import {
  Group,
  Text,
  Rect,
} from 'react-konva';
import Konva from 'konva';

// -- local imports
import WhiteboardContext from '@/context/WhiteboardContext';

import {
  type ToolChoice,
} from '@/components/Tool';

import type {
  CanvasObjectIdType,
  CanvasObjectModel,
} from '@/types/CanvasObjectModel';

import type {
  CanvasKeyType,
  CanvasIdType,
  CanvasData,
} from '@/types/WebSocketProtocol';

import {
  type ShapeAttributesState,
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

export interface CanvasProps extends CanvasData {
  shapeAttributes: ShapeAttributesState;
  currentTool: ToolChoice;
  // -- should be fetched from selector in root calling component
  childCanvasesByCanvas: Record<string, CanvasKeyType[]>;
  // -- should be fetched from selector in root calling component
  canvasesByKey: Record<string, CanvasData>;
  selectedCanvasId: CanvasIdType | null;
  setSelectedCanvasId: Dispatch<CanvasIdType | null>;
  disabled: boolean;
}

const Canvas = (props: CanvasProps) => {
  const {
    id,
    parentCanvas,
    width,
    height,
    shapes,
    shapeAttributes,
    currentTool,
    childCanvasesByCanvas,
    canvasesByKey,
    selectedCanvasId,
    setSelectedCanvasId,
    disabled,
  } = props;

  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error('No whiteboard context');
  }

  const {
    socketRef,
    setCurrentTool,
    whiteboardId,
    handleUpdateShapes,
    ownPermission,
  } = whiteboardContext;

  const groupRef = useRef<Konva.Group | null>(null);

  const handleObjectUpdateShapes = (shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => {
    handleUpdateShapes(id, shapes);
  };

  // In the future, we may wrap onAddShapes with some other logic.
  // For now, it's just an alias.
  const addShapes = (shapes: CanvasObjectModel[]) => {
    if (socketRef.current) {
      // TODO: modify backend to take multiple shapes (i.e. create_shapes)
      const createShapesMsg = ({
        type: 'create_shapes',
        canvasId: id,
        shapes
      });

      socketRef.current.send(JSON.stringify(createShapesMsg));

      // Switch to hand tool after shape creation
      setCurrentTool("hand");
    }
  };
  
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
    getPreview,
    getTooltipText
  } = dispatcher;

  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    setSelectedCanvasId(id);
    dispatcher.handlePointerDown(ev);
  };

  const handlePointerMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    dispatcher.handlePointerMove(ev);
  };

  const handlePointerUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    dispatcher.handlePointerUp(ev);
  };

  // TODO: delegate draggability to tool definitions
  const areShapesDraggable = ((ownPermission !== 'view') && (currentTool === 'hand'));

  const tooltipText = ownPermission === 'view' ? 
    'You are in view-only mode'
    : getTooltipText();

  const currCanvasKey : CanvasKeyType = [whiteboardId, id];
  const childCanvasesData : CanvasData[] = childCanvasesByCanvas[currCanvasKey.toString()]
    ?.map((childCanvasKey: CanvasKeyType) => canvasesByKey[childCanvasKey.toString()] || null)
    .filter((canvas: CanvasData | null): canvas is CanvasData => !!canvas)
    ?? [];

  const {
    originX,
    originY,
  } = parentCanvas || {
      originX: 0,
      originY: 0,
  };

  const isCanvasSelected = (id === selectedCanvasId);

  const handleMouseOver = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    const stage = ev.target.getStage();

    if (stage) {
      if (! isCanvasSelected) {
        // indicate that canvas is selectable
        stage.container().style.cursor = 'pointer';
      } else {
        stage.container().style.cursor = 'default';
      }
    }
  };// -- end handleMouseOver

  const handleMouseOut = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    const stage = ev.target.getStage();

    if (stage) {
      if (! isCanvasSelected) {
        // indicate that canvas is selectable
        stage.container().style.cursor = 'default';
      }
    }
  };// -- end handleMouseOut

  return (
    <Group
      ref={groupRef}
      x={originX}
      y={originY}
      width={width}
      height={height}
      clipWidth={width}
      clipHeight={height}
      onPointerdown={handlePointerDown}
      onPointermove={handlePointerMove}
      onPointerup={handlePointerUp}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      listening={ownPermission !== 'view'}
    >
      {/** Border **/}
      <Rect
        width={width}
        height={height}
        stroke={isCanvasSelected ? 'green' : 'black'}
        strokeWidth={isCanvasSelected ? 4 : 1}
        fill="white"
      />
      {isCanvasSelected && (
        <Text
          text={tooltipText}
          fontSize={15}
        />
      )}
      {/** Preview Shape **/}
      {getPreview()}

      {/** Shapes **/}
      {
        Object.entries(shapes).filter(([_id, sh]) => !!sh).map(([id, shape]) => {
          const renderDispatcher = dispatcherMap[shape.type] || defaultDispatcher;
          const { renderShape } = renderDispatcher;

          return renderShape(id, shape, areShapesDraggable, handleObjectUpdateShapes);
        })
      }
      {/** Layer child canvases on top **/}
      {childCanvasesData && (
        childCanvasesData.map(canvasData => (
          <Canvas
            {
              ...{
                ...props,
                ...canvasData
              }
            }
          />
        ))
      )}
    </Group>
  );
};

export default Canvas;
