import Konva from 'konva';

export interface DraggableObjectProps {
   onMouseOver?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
   onMouseOut?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
   onMouseDown?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
   onMouseUp?: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
}

const draggableObjectProps = (isDraggable: boolean): DraggableObjectProps => {
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

  return ({
    onMouseOver: isDraggable && handleMouseOver || undefined,
    onMouseOut: isDraggable && handleMouseOut || undefined,
    onMouseDown: isDraggable && handleMouseDown || undefined,
    onMouseUp: isDraggable && handleMouseUp || undefined
  });
};

export default draggableObjectProps;
