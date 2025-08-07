// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// =============================================================================

import { useRef, useEffect } from 'react';

export interface CanvasProps {
  width: number;
  height: number;
}

const Canvas = (props: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = props;

  const handleClick = (ev: React.MouseEvent<React.HTMLElement>) => {
    const boundingRect = canvasRef.current.getBoundingClientRect();
    const { x: canvasX, y: canvasY } = boundingRect;
    const { clientX, clientY } = ev;
    const offX = clientX - canvasX;
    const offY = clientY - canvasY;
    console.log(`Click received at x = ${offX}, y = ${offY}`);
  };

  // Draw initial rectangle
  useEffect(() => {
    if (canvasRef.current !== null) {
      const ctx = canvasRef.current.getContext('2d');

      ctx.fillStyle = 'rgb(200, 0, 0)';
      ctx.fillRect(10, 10, 50, 50);
    }
  }, [canvasRef.current]);

  return (
    <div>
      <h2>Canvas</h2>
      <div style={{ 'backgroundColor': 'white' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleClick}
        >
          Please enable JavaScript to enable canvas.
        </canvas>
      </div>
    </div>
  );
};

export default Canvas;
