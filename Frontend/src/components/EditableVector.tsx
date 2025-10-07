import type Konva from "konva";
import { useRef, useState } from "react";
import { Group } from "react-konva";

interface EditableVectorProps {

}

const EditableVector = (props: EditableVectorProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const vectorRef = useRef<Konva.Shape>(null);

  

  return (
    <Group>
      {}
    </Group>
  );
}

export default EditableVector;