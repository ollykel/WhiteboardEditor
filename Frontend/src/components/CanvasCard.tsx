import Canvas from "./Canvas";

function CanvasCard({ title }) {
  return (
    <div className="canvas-card">
      <div className="canvas-title">{title}</div>
      <div className="canvas">
        <Canvas
          width={512}
          height={512}
        />
      </div>
    </div>
  );
}

export default CanvasCard;