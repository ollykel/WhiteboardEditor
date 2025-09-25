import { useRef } from 'react';

import Konva from 'konva';
import { Html } from 'react-konva-utils';

interface TextEditorProps {
  textNode: Konva.Text;
  onClose: void;
  onChange: void;
}

const TextEditor = ({ textNode, onClose, onChange }: TextEditorProps) => {
  const textareaRef = useRef(null);

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