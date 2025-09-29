import { useRef, useState, useEffect, useCallback } from "react";

import { Group, Text, Transformer } from 'react-konva';

import Konva from "konva";
import TextEditor from "./TextEditor";

import { type EditableObjectProps } from "@/dispatchers/editableObjectProps";

interface EditableTextProps extends EditableObjectProps {
  id: string;
  fontSize: number;
  text: string;
  color: string;
  x: number
  y: number
  width: number
  height: number
  draggable: boolean,
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
  draggable,
  onMouseOver,
  onMouseOut,
  onMouseDown,
  onMouseUp,
  onDragEnd,
  onTransformEnd,
}: EditableTextProps) => {
  const [textContents, setTextContents] = useState(text);
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // const [textWidth, setTextWidth] = useState(width);
  // const [textHeight, setTextHeight] = useState(height);

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
    setTextContents(newText);
  }, []);

  // const handleTransform = useCallback(() => {
  //   const node = textRef.current;
  //   if (!node) return;
  //   const scaleX = node.scaleX();
  //   const scaleY = node.scaleY();
  //   const newWidth = node.width() * scaleX;
  //   const newHeight = node.height() * scaleY;
  //   setTextWidth(newWidth);
  //   setTextHeight(newHeight);
  //   node.setAttrs({
  //     width: newWidth,
  //     height: newHeight,
  //     scaleX: 1,
  //     scaleY: 1,
  //   });
  // }, []);

  return (
    <Group>
      <Text
        id={id}
        ref={textRef}
        text={textContents}
        fontSize={fontSize}
        fill={color}
        x={x}
        y={y}
        width={width}
        height={height}
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
        onTransformEnd={onTransformEnd}
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
            height: Math.max(30, newBox.height),
          })}
        />
      )}
    </ Group>
  );
}

export default EditableText;