import { useState } from "react";

import { Text } from 'react-konva';

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
      width={width}
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