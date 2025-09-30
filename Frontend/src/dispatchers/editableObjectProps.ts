import Konva from 'konva';

import type {
  CanvasObjectIdType,
  ShapeModel
} from '@/types/CanvasObjectModel';  

export interface EditableObjectProps {
  onMouseOver?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseOut?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseDown?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd?: (ev: Konva.KonvaEventObject<DragEvent>) => void;
  onTransform?: (ev: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd?: (ev: Konva.KonvaEventObject<DragEvent>) => void;
}

const editableObjectProps = <ShapeType extends ShapeModel> (
  shapeModel: ShapeType,
  isDraggable: boolean,
  handleUpdateShapes: (shapes: Record<CanvasObjectIdType, ShapeType>) => void
): EditableObjectProps => {
  const handleMouseOver = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = ev.target.getStage();

    if (stage) {
      stage.container().style.cursor = 'grab';
    }
  };

  const handleMouseOut = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = ev.target.getStage();

    if (stage) {
      stage.container().style.cursor = 'default';
    }
  };

  const handleMouseDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = ev.target.getStage();

    if (stage) {
      stage.container().style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = ev.target.getStage();

    if (stage) {
      stage.container().style.cursor = 'grab';
    }
  };

  const handleDragEnd = (ev: Konva.KonvaEventObject<DragEvent>) => {
    console.log("drag event: ", ev); // debug
    const id = ev.target.id();
    const x = ev.target.x();
    const y = ev.target.y();

    const update = {
      [id]: ({ ...shapeModel, x, y })
    };

    handleUpdateShapes(update);
    console.log("drag updateShapes event: ", update); // debug
  };

  // transform the targetted box locally in real time without broadcasting
  const handleTransform = (ev: Konva.KonvaEventObject<Event>) => {
    console.log("transform event: ", ev); // debug
    const node = ev.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const width = node.width() * scaleX;
    const height = node.height() * scaleY;

    // apply new size locally so text stays crisp
    node.width(width);
    node.height(height);
    node.scaleX(1);
    node.scaleY(1);
  };

  // once the transform ends, send the update to server to broadcast
  const handleTransformEnd = (ev: Konva.KonvaEventObject<Event>) => {
    console.log("transform end event: ", ev); // debug
    const node = ev.target;
    const id = node.id();
    const rotation = node.rotation();

    const update = {
      [id]: {
        ...shapeModel,
        x: node.x(),
        y: node.y(),
        width: node.width(),
        height: node.height(),
        rotation,
      }
    };

    handleUpdateShapes(update);
    console.log("transform end updateShapes event: ", update); // debug
  };

  return ({
    onMouseOver: isDraggable && handleMouseOver || undefined,
    onMouseOut: isDraggable && handleMouseOut || undefined,
    onMouseDown: isDraggable && handleMouseDown || undefined,
    onMouseUp: isDraggable && handleMouseUp || undefined,
    onDragEnd: isDraggable && handleDragEnd || undefined,
    onTransform: handleTransform || undefined,
    onTransformEnd: handleTransformEnd || undefined,
  });
};

export default editableObjectProps;
