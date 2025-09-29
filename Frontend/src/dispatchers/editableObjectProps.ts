import { useCallback } from 'react';

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
    console.log("event: ", ev); // debug
    console.log("event target: ", ev.target); // debug
    const id = ev.target.id();
    const x = ev.target.x();
    const y = ev.target.y();
    console.log("id: ", id); // debug

    const update = {
      [id]: ({ ...shapeModel, x, y })
    };

    console.log("Update: ", update); // debug
    handleUpdateShapes(update);
  };

  const handleTransformEnd = useCallback((ev: Konva.KonvaEventObject<DragEvent>) => {
    const node = ev.target;
    const id = node.id();
    if (!node) return;

    // Convert the final scale into width/height
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const width = node.width() * scaleX;
    const height = node.height() * scaleY;
    const rotation = node.rotation();

    // Apply those numbers directly to the node so it keeps the new size
    node.width(width);
    node.height(height);
    node.scaleX(1);
    node.scaleY(1);

    // Now broadcast **once**
    handleUpdateShapes({
      [id]: ({ ...shapeModel, x: node.x(), y: node.y(), width, height, rotation })
    });
  }, []);

  return ({
    onMouseOver: isDraggable && handleMouseOver || undefined,
    onMouseOut: isDraggable && handleMouseOut || undefined,
    onMouseDown: isDraggable && handleMouseDown || undefined,
    onMouseUp: isDraggable && handleMouseUp || undefined,
    onDragEnd: isDraggable && handleDragEnd || undefined,
    onTransformEnd: handleTransformEnd || undefined,
  });
};

export default editableObjectProps;
