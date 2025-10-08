import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Circle, Group, type KonvaNodeEvents } from "react-konva";
import type { CanvasObjectIdType, VectorModel } from "@/types/CanvasObjectModel";
import type { EditableObjectProps } from "@/dispatchers/editableObjectProps";
import editableObjectProps from "@/dispatchers/editableObjectProps";

interface EditableVectorProps<VectorType extends VectorModel> extends EditableObjectProps {
  id: string;
  shapeModel: VectorType;
  draggable: boolean;
  handleUpdateShapes: (shapes: Record<CanvasObjectIdType, VectorType>) => void;
  children: React.ReactElement<Konva.NodeConfig & KonvaNodeEvents>;
}

const EditableVector = <VectorType extends VectorModel>({
  id,
  shapeModel,
  draggable,
  handleUpdateShapes,
  children,
  ...props
}: EditableVectorProps<VectorType>) => {
  const [isSelected, setIsSelected] = useState(false);
  const [localPoints, setLocalPoints] = useState(shapeModel.points);
  const vectorRef = useRef<Konva.Shape>(null);

  const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsSelected(true);
  };

  // Click outside to deselect
  useEffect(() => {
    const stage = vectorRef.current?.getStage();
    if (!stage) return;

    const listener = (ev: Konva.KonvaEventObject<MouseEvent>) => {
      if (ev.target !== vectorRef.current) setIsSelected(false);
    };

    stage.on("click", listener);
    return () => {
      stage.off("click", listener);
    };
  }, []);

  const updatePoints = (newPoints: number[]) => {
    setLocalPoints(newPoints);
    handleUpdateShapes({
      [id]: {
        type: "vector",
        points: newPoints,
        strokeColor: shapeModel.strokeColor,
        strokeWidth: shapeModel.strokeWidth,
      } as VectorType,
    });
  };

  const handleAnchorDrag = (index: number, e: Konva.KonvaEventObject<DragEvent>) => {
    const newPoints = [...localPoints];
    newPoints[index * 2] = e.target.x();
    newPoints[index * 2 + 1] = e.target.y();
    updatePoints(newPoints);
  };

  return (
  <Group>
    {React.cloneElement(children, {
      id,
      ref: vectorRef,
      draggable,
      onClick: handleSelect,
      onTap: handleSelect,
      hitStrokeWidth: 20,
      ...editableObjectProps(shapeModel, draggable, handleUpdateShapes),
      ...props
    })}

    {isSelected && (
      <>
        <Circle
          x={localPoints[0]}
          y={localPoints[1]}
          radius={6}
          fill="#ddd"
          stroke="#5b6263ff"
          strokeWidth={2}
          draggable
          onDragMove={(e) => handleAnchorDrag(0, e)}
        />
        <Circle
          x={localPoints[2]}
          y={localPoints[3]}
          radius={6}
          fill="#ddd"
          stroke="#5b6263ff"
          strokeWidth={2}
          draggable
          onDragMove={(e) => handleAnchorDrag(1, e)}
        />
      </>
    )}
  </Group>
);

};

export default EditableVector;
