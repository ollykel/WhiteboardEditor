import { useRef, useState, useEffect, useCallback } from "react";

import { Group, Text, Transformer } from 'react-konva';

import Konva from "konva";
import TextEditor from "./TextEditor";

interface EditableTextProps {
  fontSize: number;
  color: string;
  x: number
  y: number
  width: number
  height: number
  draggable: boolean 
  // onDblClick: 
  // onDblTap={handleTextDblClick}: 
  // onTransform={handleTransform}
  // visible
}

const EditableText = ({
  fontSize,
  color,
  x,
  y,
  width,
  height,
  draggable,
}: EditableTextProps) => {
  const [text, setText] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [textWidth, setTextWidth] = useState(width);

  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // attach Transformer for editing when selected
  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected])

  // deslect when clicking outside
  useEffect(() => {
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        setIsEditing(false);
        setIsSelected(false);
      }
    };

    const stage = textRef.current?.getStage();
    stage?.on("click", handleStageClick);

    return () => {
      stage?.off("click", handleStageClick);
    };
  }, []);

  const handleSelect = useCallback(() => {
    if (!isEditing) setIsSelected(true);
  }, [isEditing]);

  const handleTextDblClick = useCallback((): void => {
    setIsEditing(true);
    setIsSelected(false); 
    console.log("Double clicked");
  }, []);

  const handleTextChange = useCallback((newText: string): void => {
    setText(newText);
  }, []);

  const handleTransform = useCallback(() => {
    const node = textRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const newWidth = node.width() * scaleX;
    setTextWidth(newWidth);
    node.setAttrs({
      width: newWidth,
      scaleX: 1,
    });
  }, []);

  return (
    <Group>
      <Text
        ref={textRef}
        text={text}
        fontSize={fontSize}
        fill={color}
        x={x}
        y={y}
        width={textWidth}
        height={height}
        draggable={draggable}
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransform={handleTransform}
        listening={!isEditing}
      />
      {isEditing && textRef.current && (
        <TextEditor
          textNode={textRef.current}
          onChange={handleTextChange}
          onClose={() => setIsEditing(false)}
        />
      )} 
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(_oldBox, newBox) => ({
            ...newBox,
            width: Math.max(30, newBox.width),
          })}
        />
      )}
    </ Group>
  );
}

export default EditableText;