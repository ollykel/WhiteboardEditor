import Konva from 'konva';

import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectIdType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';


// === useInaccessibleDispatcher ===============================================
//
// Used for keeping users from accessing inaccessible canvases.
//
// =============================================================================
const useInaccessibleDispatcher = (_props: OperationDispatcherProps): OperationDispatcher => {
  return ({
    handlePointerDown: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      console.log("You don't have access to this canvas");
    },
    handlePointerMove: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      console.log("You don't have access to this canvas");
    },
    handlePointerUp: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      console.log("You don't have access to this canvas");
    },
    getPreview: () => null,
    renderShape: (
      _key: string | number,
      _model: CanvasObjectModel,
      _isDraggable: boolean,
      _handleUpdateShapes: (shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => void
    ) => null,
    getTooltipText: () => "You don't have access to this canvas"
  });
};

export default useInaccessibleDispatcher;
