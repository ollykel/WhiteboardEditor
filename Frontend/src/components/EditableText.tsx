import { useRef, useState, useEffect, useCallback } from "react";

import { Text, Transformer } from 'react-konva';

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
  const [text, setText] = useState("Enter Text Here");
  const [isEditing, setIsEditing] = useState(false);
  const [textWidth, setTextWidth] = useState(width);
  const textRef = useRef<Konva.Text | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  if (!textRef.current) {
    return;
  }

  useEffect(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
    }
  }, [isEditing])

  const handleTextDblClick = useCallback((): void => {
    setIsEditing(true);
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
    <div>
      <Text
        text={text}
        fontSize={fontSize}
        color={color}
        x={x}
        y={y}
        width={textWidth}
        height={height}
        draggable={draggable}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransform={handleTransform}
        visible={!isEditing}
      />
      {isEditing && (
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
    </div>
  );
}

export default EditableText;