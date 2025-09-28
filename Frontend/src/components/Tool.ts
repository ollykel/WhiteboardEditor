
export type ToolChoice = 'hand' | 'rect' | 'ellipse' | 'vector' | 'text';

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
    default:
      return 'UNDEFINED';
  }// end switch (toolChoice)
};// end getToolChoiceLabel

export {
  getToolChoiceLabel
};
