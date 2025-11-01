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
  useEffect,
  useState,
} from 'react';
import {
  Group,
  Text,
  Rect,
} from 'react-konva';
import Konva from 'konva';

import {
  useSelector,
} from 'react-redux';

// -- local imports
import WhiteboardContext from '@/context/WhiteboardContext';

import UserCacheContext from '@/context/UserCacheContext';

import {
  type RootState,
} from '@/store';

import {
  selectAllowedUsersByCanvas,
} from '@/store/allowedUsers/allowedUsersByCanvasSlice';

import {
  useUser,
} from '@/hooks/useUser';

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
  ClientMessageEditingCanvas,
} from '@/types/WebSocketProtocol';

import {
  type User,
} from '@/types/UserAuth';

import {
  type ShapeAttributesState,
} from '@/reducers/shapeAttributesReducer';

import type {
  OperationDispatcher,
} from '@/types/OperationDispatcher';

import {
  type NewCanvasDimensions,
} from '@/types/CreateCanvas';

// -- dispatchers
import useMockDispatcher from '@/dispatchers/useMockDispatcher';
import useInaccessibleDispatcher from '@/dispatchers/useInaccessibleDispatcher';
import useRectangleDispatcher from '@/dispatchers/useRectangleDispatcher';
import useEllipseDispatcher from '@/dispatchers/useEllipseDispatcher';
import useVectorDispatcher from '@/dispatchers/useVectorDispatcher';
import useHandDispatcher from '@/dispatchers/useHandDispatcher';
import useTextDispatcher from '@/dispatchers/useTextDispatcher';
import useCreateCanvasDispatcher from '@/dispatchers/useCreateCanvasDispatcher';

export interface CanvasProps extends CanvasData {
  shapeAttributes: ShapeAttributesState;
  currentTool: ToolChoice;
  // -- should be fetched from selector in root calling component
  childCanvasesByCanvas: Record<string, CanvasKeyType[]>;
  // -- should be fetched from selector in root calling component
  canvasesByKey: Record<string, CanvasData>;
  // -- editor identified by user id
  currentEditorByCanvas: Record<string, string>;
  onSelectCanvasDimensions: (canvasId: CanvasIdType, dimensions: NewCanvasDimensions) => void;
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
    currentEditorByCanvas,
    onSelectCanvasDimensions,
  } = props;

  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error('No whiteboard context');
  }

  const userCacheContext = useContext(UserCacheContext);

  if (! userCacheContext) {
    throw new Error('No user cache context provided to Canvas');
  }

  const {
    whiteboardId,
    socketRef,
    setCurrentTool,
    handleUpdateShapes,
    ownPermission,
    currentDispatcher,
    setCurrentDispatcher,
    selectedCanvasId,
    setSelectedCanvasId,
  } = whiteboardContext;

  const {
    getUserById,
  } = userCacheContext;

  const {
    user,
  } = useUser();

  const canvasKey : CanvasKeyType = [whiteboardId, id];

  const allowedUserIds = useSelector(
    // ['', ''] is effectively a null canvas key
    (state: RootState) => selectAllowedUsersByCanvas(state, canvasKey || ['', ''])
  );

  const currentEditorId : string | null = currentEditorByCanvas[id] || null;

  const [currentEditor, setCurrentEditor] = useState<User | null>(null);

  useEffect(
    () => {
      const fetchCurrentEditor = async () => {
        if (currentEditorId) {
          const user : User | null = await getUserById(currentEditorId);

          setCurrentEditor(user);
        } else {
          setCurrentEditor(null);
        }
      };

      fetchCurrentEditor();
    },
    [currentEditorId, setCurrentEditor, getUserById]
  );

  const userHasAccess = user?.id
    ? allowedUserIds === undefined || allowedUserIds.length === 0 || allowedUserIds.includes(user.id)
    : false;

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
  };// -- end addShapes

  const notifyStartEditing = () => {
    if (socketRef.current) {
      const editingCanvasMsg : ClientMessageEditingCanvas = {
        type: 'editing_canvas',
        canvasId: id,
      };

      socketRef.current.send(JSON.stringify(editingCanvasMsg));
    }
  };// -- end notifyStartEditing
  
  const defaultDispatcher = useMockDispatcher({
    shapeAttributes,
    addShapes
  });
  const inaccessibleDispatcher = useInaccessibleDispatcher({
    shapeAttributes,
    addShapes
  });

  const dispatcherMap : Record<ToolChoice, OperationDispatcher> = {
    'hand': useHandDispatcher({
      shapeAttributes,
      addShapes,
      onStartEditing: notifyStartEditing,
    }),
    'rect': useRectangleDispatcher({
      shapeAttributes,
      addShapes,
      onStartEditing: notifyStartEditing,
    }),
    'ellipse': useEllipseDispatcher({
      shapeAttributes,
      addShapes,
      onStartEditing: notifyStartEditing,
    }),
    'vector': useVectorDispatcher({
      shapeAttributes,
      addShapes,
      onStartEditing: notifyStartEditing,
    }),
    'text': useTextDispatcher({
      shapeAttributes,
      addShapes,
      onStartEditing: notifyStartEditing,
    }),
    'create_canvas': useCreateCanvasDispatcher({
      shapeAttributes,
      addShapes,
      onCreate: (dimensions: NewCanvasDimensions) => {
        onSelectCanvasDimensions(id, dimensions);
      },
    }),
  };

  let dispatcher: OperationDispatcher;

  if (! userHasAccess) {
    dispatcher = inaccessibleDispatcher;
  } else {
    dispatcher = dispatcherMap[currentTool] || defaultDispatcher;
  }

  useEffect(() => {
    if (currentDispatcher !== dispatcher) {
      setCurrentDispatcher(dispatcher);
    }
  }, [currentTool]);

  const {
    getPreview,
    getTooltipText
  } = dispatcher;

  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    if (selectedCanvasId === id) {
      dispatcher.handlePointerDown(ev);
    }

    setSelectedCanvasId(id);
  };

  const handlePointerMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    dispatcher.handlePointerMove(ev);
  };

  const handlePointerUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    if (selectedCanvasId === id) {
      dispatcher.handlePointerUp(ev);
    }

    setSelectedCanvasId(id);
  };

  // TODO: delegate draggability to tool definitions
  const areShapesDraggable = ((ownPermission !== 'view') && (currentTool === 'hand') && userHasAccess);

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

  let canvasFrameColor : 'black' | 'green' | 'red';
  let canvasFrameWidth : number;

  if (currentEditor && (currentEditor.id !== user?.id)) {
    canvasFrameColor = 'red';
    canvasFrameWidth = 4;
  } else if (isCanvasSelected) {
    canvasFrameColor = 'green';
    canvasFrameWidth = 4;
  } else {
    canvasFrameColor = 'black';
    canvasFrameWidth = 1;
  }

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
        stroke={canvasFrameColor}
        strokeWidth={canvasFrameWidth}
        fill="white"
      />
      {isCanvasSelected && (
        <Text
          text={tooltipText}
          fontSize={15}
        />
      )}

      {/** Display current editor, if given **/}
      {currentEditor && (
        <Text
          text={
            currentEditor.id === user?.id ?
              'You are currently editing'
              : `${currentEditor.username} is currently editing`
          }
          fontSize={15}
          fontStyle="italic"
          height={height}
          verticalAlign="bottom"
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
