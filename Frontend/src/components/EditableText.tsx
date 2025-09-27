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
  const [isEditing, setIsEditing] = useState(true);
  const [textWidth, setTextWidth] = useState(width);
  const textRef = useRef<Konva.Text | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
    }
  }, [isEditing])

  const handleTextDblClick = useCallback((): void => {
    setIsEditing(true);
    console.log("Double clicked");
  }, []);

  const handleTextChange = useCallback((newText: string): void => {
    setText(newText);
  }, []);

  const handleTransform = useCallback(() => {
    const node = textRef.current;
    if (!node) return;
    const scaleX = node?.scaleX();
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
      {!isEditing && (
        <Transformer
          ref={trRef}
          enabledAnchors={["middle-left", "middle-right"]}
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