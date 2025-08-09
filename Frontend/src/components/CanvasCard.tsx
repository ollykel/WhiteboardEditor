import Canvas from "./Canvas";

interface CanvasCardProps {
  title: string;
}

function CanvasCard({ title }: CanvasCardProps) {
  return (
    <div className="flex flex-col p-6">
      {/* Active Users */}
      <div className="text-center">Active Users: </div>
      {/* Title */}
      <div className="text-center p-4">{title}</div>
      {/* Konva Canvas */}
      <div className="border border-black">
        <Canvas
          width={512}
          height={512}
        />
      </div>
      {/* Currently Drawing */}
      <div className="currently-drawing">Joe is drawing...</div>
    </div>
  );
}

export default CanvasCard;