import { useRef, useState, useEffect, useCallback } from "react";

import { Group, Text, Transformer } from 'react-konva';

import Konva from "konva";
import TextEditor from "./TextEditor";

import { type EditableObjectProps } from "@/dispatchers/editableObjectProps";
import type { CanvasObjectIdType, ShapeModel, TextModel } from "@/types/CanvasObjectModel";

interface EditableTextProps extends EditableObjectProps {
  id: string;
  fontSize: number;
  text: string;
  color: string;
  x: number;
  y: number;
  width: number;    
  height: number;   
  rotation: number;
  draggable: boolean; 
  shapeModel: TextModel;
  handleUpdateShapes: (shapes: Record<CanvasObjectIdType, ShapeModel>) => void
}

const EditableText = ({
  id,
  fontSize,
  text,
  color,
  x,
  y,
  width,
  height,
  rotation,
  draggable,
  shapeModel,
  handleUpdateShapes,
  onMouseOver,
  onMouseOut,
  onMouseDown,
  onMouseUp,
  onDragEnd,
  onTransform,
  onTransformEnd,
}: EditableTextProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text);

  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // attach Transformer for editing when selected
  useEffect(() => {
    if (trRef.current) {
      if (isSelected && textRef.current) {
        trRef.current.nodes([textRef.current]);
      }
      else {
        trRef.current.nodes([]);
      }
    }
  }, [isSelected])

  // deselect when clicking outside of text node
  useEffect(() => {
    if (isEditing) return;

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.detail === 2) {
        return;
      }
      if (e.target !== textRef.current) {
        setIsSelected(false);
      }
    };

    const stage = textRef.current?.getStage();
    if (!stage) return;
    stage.on("click", handleStageClick);
    return () => {
      stage.off("click", handleStageClick);
    };
  }, []);

  const handleSelect = useCallback(() => {
    if (!isEditing) setIsSelected(true);
  }, [isEditing]);

  const handleTextDblClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsEditing(true);
    setIsSelected(false); 
  }, []);

  const handleTextChange = useCallback((newText: string): void => {
    console.log("text change event new text: ", newText) // debug
    const node = textRef.current;
    if (!node) return;

    const update = {
      [id]: {
        ...shapeModel,
        text: newText,
        x: node.x(),
        y: node.y(),
        width: node.width(),
        height: node.height(),
        rotation: node.rotation(),
      }
    };

    handleUpdateShapes(update);
    console.log("text change updateShapes event: ", update); // debug
  }, []);

  return (
    <Group>
      <Text
        id={id}
        ref={textRef}
        text={localText}
        fontSize={fontSize}
        fill={color}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={draggable}
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        listening={!isEditing}
        visible={!isEditing}
        onDragEnd={onDragEnd}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onMouseOut={onMouseOut}
        onMouseOver={onMouseOver}
        onTransform={onTransform} 
        onTransformEnd={onTransformEnd}
      />
      {isEditing && textRef.current && (
        <TextEditor
          textNode={textRef.current}
          onChange={setLocalText}
          onClose={() => {
            handleTextChange(localText);
            setIsEditing(false);
          }}
        />
      )} 
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(_oldBox, newBox) => ({
            ...newBox,
            width: Math.max(30, newBox.width),
            height: Math.max(30, newBox.height),
          })}
        />
      )}
    </ Group>
  );
}

export default EditableText;