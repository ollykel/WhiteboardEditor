import { useState, useRef } from 'react';

import CanvasCard from "@/components/CanvasCard";
import Toolbar from "@/components/Toolbar";
import Header from '@/components/Header';

import type { ToolChoice } from '@/components/Tool';

// TODO: Swap out hardcoded placeholders with dynamic data
const title = "My First Whiteboard";

const Whiteboard = () => {
  const [toolChoice, setToolChoice] = useState<ToolChoice>('rect');
  const [canvases, setCanvases] = useState<{ id: number, title: string, accessible: boolean }[]>([{ id: 1, title: "Canvas A", accessible: true }]);

  const nextID = useRef(2);
  const nextCanvasTitle = useRef(66);

  const handleNewCanvas = () => {
    const titleChar = String.fromCharCode(nextCanvasTitle.current);
    nextCanvasTitle.current += 1;

    const idNum = nextID.current;
    nextID.current += 1;

    setCanvases(prev => [
      ...prev,
      {
        id: idNum,
        title: `Canvas ${titleChar}`,
        accessible: true,
      }
    ]);
  }

  return (
    <main>
      {/* Header */}
      <Header 
        title={title}
      />
      {/* Content */}
      <div className="mt-20">
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
              accessible={canvas.accessible}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;
