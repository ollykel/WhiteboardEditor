import { useRef, useState, useEffect } from "react";

import { Text, Transformer } from 'react-konva';

import Konva from "konva";

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

  useEffect(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
    }
  }, [isEditing])

  const handleTextDblClick = (): void => {
    // Placeholders, remove
    console.log("isEditing: ", isEditing);
    handleTextChange();

    setIsEditing(true);
  }

  const handleTextChange = (): void => {
    setText("Clicked");
  }

  return (
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
      // onDblTap={handleTextDblClick}
      // onTransform={handleTransform}
      // visible={!isEditing}
    />
  );
}

export default EditableText;