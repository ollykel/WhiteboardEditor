import { useRef } from 'react';

import Konva from 'konva';
import { Html } from 'react-konva-utils';

interface TextEditorProps {
  textNode: Konva.Text;
  onClose: () => void;
  onChange: (value: string) => void;
}

const TextEditor = ({ textNode, onClose, onChange }: TextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  if (!textareaRef.current) {
    return;
  }

  const textarea = textareaRef.current;
  const stage = textNode.getStage();
  const textPosition = textNode.position();
  const stageBox = stage?.container().getBoundingClientRect();
  const areaPosition = {
    x: textPosition.x,
    y: textPosition.y,
  }

  // Match styles with the text node
  textarea.value = textNode.text();
  textarea.style.position = "absolute";
  textarea.style.top = `${areaPosition.y}px`;
  textarea.style.left = `${areaPosition.x}px`;
  textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
  textarea.style.height = `${
    textNode.height() - textNode.padding() * 2 + 5
  }px`;
  textarea.style.fontSize = `${textNode.fontSize()}px`;
  textarea.style.border = "none";
  textarea.style.padding = "20px";
  textarea.style.margin = "0px";
  textarea.style.overflow = "hidden";
  textarea.style.background = "none";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.lineHeight = String(textNode.lineHeight());
  textarea.style.fontFamily = textNode.fontFamily();
  textarea.style.transformOrigin = "left top";
  textarea.style.textAlign = textNode.align();
  const fill = textNode.fill();
  if (typeof fill === "string") {
    textarea.style.color = fill;
  }

  const rotation = textNode.rotation();
  let transform = "";
  if (rotation) {
    transform += `rotateZ(${rotation}deg)`;
  }
  textarea.style.transform = transform;

  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight + 3}px`;

  textarea.focus();

  const handleOutsideClick = (e) => {
    if (e.target !== textarea) {
      onChange(textarea.value);
      onClose();
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onChange(textarea.value);
      onClose();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }

  const handleInput = () => {
    const scale = textNode.getAbsoluteScale().x;
    textarea.style.width = `${textNode.width() * scale}px`;
    textarea.style.height = "auto";
    textarea.style.height = `${
      textarea.scrollHeight + textNode.fontSize()
    }px`;
  }

  return (
    <Html>
      <textarea 
        ref={textareaRef}
        style={{
          minHeight: "1rem",
          position: "absolute",
        }}
      />
    </Html>
  );
}

export default TextEditor;