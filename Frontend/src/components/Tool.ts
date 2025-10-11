
export type ToolChoice =
  | 'hand' 
  | 'rect' 
  | 'ellipse' 
  | 'vector' 
  | 'text'
  | 'create_canvas'
;

const getToolChoiceLabel = (toolChoice: ToolChoice): string => {
  switch (toolChoice) {
    case 'hand':
      return 'Hand';
    case 'rect':
      return 'Rectangle';
    case 'vector':
      return 'Vector Tool';
    case 'ellipse':
      return 'Ellipse';
    case 'text':
      return 'Text';
    case 'create_canvas':
      return 'Create Canvas';
    default:
      throw new Error(`Unrecognized tool choice: ${toolChoice}`);
  }// end switch (toolChoice)
};// end getToolChoiceLabel

export {
  getToolChoiceLabel
};
