import { Text } from 'react-konva';

interface EditableTextProps {
  text: string;
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
  text,
  fontSize,
  color,
  x,
  y,
  width,
  height,
  draggable,
}: EditableTextProps) => {
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
      // onDblClick={handleTextDblClick}
      // onDblTap={handleTextDblClick}
      // onTransform={handleTransform}
      // visible={!isEditing}
    />
  );
}

export default EditableText;