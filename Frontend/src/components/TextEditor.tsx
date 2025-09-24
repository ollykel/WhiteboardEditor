import { useRef } from 'react';

import { Html } from 'react-konva-utils';

const TextEditor = ({ textNode, onClose, onChange }) => {
  const textareaRef = useRef(null);

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