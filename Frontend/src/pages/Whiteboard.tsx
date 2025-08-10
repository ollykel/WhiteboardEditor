import { useState, useRef } from 'react';

import CanvasCard from "@/components/CanvasCard";
import Toolbar from "@/components/Toolbar";

import type { ToolChoice } from '@/components/Tool';

// TODO: Swap out hardcoded placeholders with dynamic data
const title = "My First Whiteboard";

const Whiteboard = () => {
  const [toolChoice, setToolChoice] = useState<ToolChoice>('rect');
  const [canvases, setCanvases] = useState<{ id: number, title: string }[]>([{ id: 1, title: "Canvas A" }]);

  const nextID = useRef(1);
  const nextCanvasTitle = useRef(65);

  const handleNewCanvas = () => {
    setCanvases(prev => [
      ...prev,
      {
        id: nextID.current++,
        title: `Canvas ${String.fromCharCode(nextCanvasTitle.current++)}`,
      }
    ]);
  }

  return (
    <main className="flex flex-col justify-center"> {/* Might not need this to be flex anymore */}
      {/* Header | TODO: separate into Header component */}
      <div className="fixed top-1 left-0 right-0 max-h-15 text-center shadow-md rounded-2xl mx-20 m-1 p-3 bg-stone-50"> 
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 justify-center items-center mt-20"> {/* Might not need this to be flex anymore */}
        {/* Toolbar */}
        <Toolbar 
          toolChoice={toolChoice}
          onToolChange={setToolChoice}
          onNewCanvas={handleNewCanvas}
        />
        {/* Canvas Container */}
        <div className="flex flex-1 flex-row justify-center flex-wrap ml-40">
          {canvases.map((canvas) => (
            <CanvasCard
              key={canvas.id}
              title={canvas.title}
              width={512}
              height={512}
              currentTool={toolChoice}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;
