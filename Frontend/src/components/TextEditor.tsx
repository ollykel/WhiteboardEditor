import { useRef, useState } from 'react';

import Konva from 'konva';
import { Html } from 'react-konva-utils';

interface TextEditorProps {
  textNode: Konva.Text;
  onChange: (value: string) => void;
  onClose: () => void;
}

const TextEditor = ({ textNode, onChange, onClose }: TextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState<string>(textNode.text());

  const initTextArea = (textarea: HTMLTextAreaElement) => {
    const stage = textNode.getStage();
    // const stageBox = stage?.container().getBoundingClientRect();
    const textPosition = stage ? textNode.getAbsolutePosition(stage) : textNode.position();
    const areaPosition = {
      x: textPosition.x,
      y: textPosition.y,
    }
  
    // Match styles with the text node
    textarea.value = text;
    textarea.style.position = "absolute";
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width()}px`;
    textarea.style.height = `${textNode.height()}px`;
    textarea.style.fontSize = `${textNode.fontSize()}px`;
    textarea.style.border = "none";
    textarea.style.padding = "0px";
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
  
    const handleOutsideClick = (e: MouseEvent) => {
      if (e.detail === 2) return; // this enabled multiple subsequent edits

      if (e.target !== textarea) {
        onChange(text);
        onClose();
      }
    }
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onChange(text);
        onClose();
      }
      if (e.key === "Escape") {
        onClose();
      }
    }
  
    const handleInput = () => {
      setText(textarea.value);
      console.log("set text to: ", textarea.value); // debug

      const scale = textNode.getAbsoluteScale().x;
      textarea.style.width = `${textNode.width() * scale}px`;
      textarea.style.height = "auto";
      textarea.style.height = `${
        textarea.scrollHeight + textNode.fontSize()
      }px`;
    }
  
    textarea.addEventListener("keydown", handleKeyDown);
    textarea.addEventListener("input", handleInput);
    setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
    });
  
    return () => {
      textarea.removeEventListener("keydown", handleKeyDown);
      textarea.removeEventListener("input", handleInput);
      window.removeEventListener("click", handleOutsideClick);
    };
  }

  return (
    <Html>
      <textarea 
        placeholder="Enter text here"
        ref={(elem) => {
          if (elem) {
            textareaRef.current = elem;
            initTextArea(elem);
          }
        }}
        style={{
          minHeight: "1rem",
          position: "absolute",
        }}
      />
    </Html>
  );
}

export default TextEditor;