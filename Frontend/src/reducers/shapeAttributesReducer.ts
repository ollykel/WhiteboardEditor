// === shapeAttributesReducer ==================================================
//
// Controls the attributes that newly drawn shapes are given, independent of any
// single action. This includes colors, border widths, etc.
//
// =============================================================================

// -- local imports
import type { ShapeModelBase } from '@/types/CanvasObjectModel';

// === ShapeAttributesState ====================================================
//
// Defines the basic attributes newly drawn shapes will have.
//
// =============================================================================
export type ShapeAttributesState = ShapeModelBase;

export type ShapeAttributesAction = 
  | { type: 'SET_FILL_COLOR'; payload: string }
  | { type: 'SET_STROKE_COLOR'; payload: string }
  | { type: 'SET_STROKE_WIDTH'; payload: number }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_FONT_COLOR'; payload: string }
;

const shapeAttributesReducer = (state: ShapeAttributesState, action: ShapeAttributesAction) => {
  switch (action.type) {
    case 'SET_FILL_COLOR':
      return ({ ...state, fillColor: action.payload });
    case 'SET_STROKE_COLOR':
      return ({ ...state, strokeColor: action.payload });
    case 'SET_STROKE_WIDTH':
      return ({ ...state, strokeWidth: action.payload });
    case 'SET_FONT_SIZE':
      return ({ ...state, fontSize: action.payload });
    case 'SET_FONT_COLOR':
      return ({ ...state, color: action.payload });
    default:
      return state;
  }// end switch (action.type)
};

export default shapeAttributesReducer;
