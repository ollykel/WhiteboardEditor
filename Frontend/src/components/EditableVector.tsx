import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Group } from "react-konva";

interface EditableVectorProps {
  points: number[];
}

// Function to build anchor point
function buildAnchor(layer: Konva.Layer, x: number, y: number) {
  const anchor = new Konva.Circle({
    x: x,
    y: y,
    radius: 5,
    stroke: "#666",
    fill: "#ddd",
    strokeWidth: 2,
    draggable: true,
  });
  layer.add(anchor);

  // Add hover styling
  anchor.on("mouseover", function () {
    document.body.style.cursor = "pointer";
    this.strokeWidth(4);
  });

  anchor.on("mouseout", function () {
    document.body.style.cursor = "default";
    this.strokeWidth(2);
  });

  // Update curves when anchor is moved
  anchor.on("dragmove", function () {
    // updateDottedLines();
  });

  return anchor;
}

const EditableVector = (props: EditableVectorProps) => {
  const {
    points,
  } = props;

  const [isSelected, setIsSelected] = useState(false);
  const vectorRef = useRef<Konva.Shape>(null);
  
  if (!vectorRef.current) return;
  const layer = vectorRef.current.getLayer();

  const x1 = points[0];
  const y1 = points[1];
  const x2 = points[2];
  const y2 = points[3];

  // Anchor points attach/detach
  useEffect(() => {
    if (!layer) return;
    if (isSelected) {
      buildAnchor(layer, x1, y1);
      buildAnchor(layer, x2, y2); 
    }
  }, [isSelected]);

  return (
    <Group>
      {}
    </Group>
  );
}

export default EditableVector;