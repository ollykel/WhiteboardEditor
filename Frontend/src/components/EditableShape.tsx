import type { EditableObjectProps } from "@/dispatchers/editableObjectProps";
import editableObjectProps from "@/dispatchers/editableObjectProps";
import type { CanvasObjectIdType, ShapeModel } from "@/types/CanvasObjectModel";
import type Konva from "konva";
import React, { useEffect, useRef, useState } from "react";
import { Group, Transformer, type KonvaNodeEvents } from "react-konva";

interface EditableShapeProps<ShapeType extends ShapeModel> extends EditableObjectProps {
  id: string;
  shapeModel: ShapeType;
  draggable: boolean;
  handleUpdateShapes: (shapes: Record<CanvasObjectIdType, ShapeType>) => void;
  children: React.ReactElement<Konva.NodeConfig & KonvaNodeEvents>;
}

const EditableShape = <ShapeType extends ShapeModel> ({
  id,
  shapeModel,
  draggable,
  handleUpdateShapes,
  children,
  ...props
}: EditableShapeProps<ShapeType>) => {
  const [isSelected, setIsSelected] = useState(false);
  const shapeRef = useRef<Konva.Shape>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Transformer attach/detach
  useEffect(() => {
    if (!trRef.current || !shapeRef.current) return;
    trRef.current.nodes(isSelected ? [shapeRef.current] : []);
  }, [isSelected]);

  const handleSelect = () => setIsSelected(true);

  // Click outside to deselect
  useEffect(() => {
    const stage = shapeRef.current?.getStage();
    if (!stage) return;

    const listener = (ev: Konva.KonvaEventObject<MouseEvent>) => {
      if (ev.target !== shapeRef.current) setIsSelected(false);
    };

    stage.on("click", listener);
    return () => {
      stage.off("click", listener)
    };
  }, []);

  return (
    <Group>
      {React.cloneElement(children, {
        id,
        ref: shapeRef,
        draggable,
        onClick: handleSelect,
        onTap: handleSelect,
        ...editableObjectProps(shapeModel, draggable, handleUpdateShapes),
        ...props
      })}
      {isSelected && <Transformer ref={trRef} />}
    </Group>
  );
}

export default EditableShape;