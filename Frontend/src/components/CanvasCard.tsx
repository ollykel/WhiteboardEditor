import Canvas from "./Canvas";

interface CanvasCardProps {
  title: string;
}

function CanvasCard({ title }: CanvasCardProps) {
  return (
    <div className="canvas-card">
      <div className="active-users">Active Users: </div>
      <div className="canvas-title">{title}</div>
      <div className="canvas">
        <Canvas
          width={512}
          height={512}
        />
      </div>
      <div className="currently-drawing">Joe is drawing...</div>
    </div>
  );
}

export default CanvasCard;