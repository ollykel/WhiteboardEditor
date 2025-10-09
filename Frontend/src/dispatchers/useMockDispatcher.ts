import Konva from 'konva';

import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectIdType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

// === useMockDispatcher =======================================================
// Use as a dummy for unimplemented functionalities.
//
// =============================================================================
const useMockDispatcher = (_props: OperationDispatcherProps): OperationDispatcher => {
  return ({
    handlePointerDown: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      console.log('TODO: implement');
    },
    handlePointerMove: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      console.log('TODO: implement');
    },
    handlePointerUp: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      console.log('TODO: implement');
    },
    getPreview: () => null,
    renderShape: (
      _key: string | number,
      _model: CanvasObjectModel,
      _isDraggable: boolean,
      _handleUpdateShapes: (shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => void
    ) => null,
    getTooltipText: () => "TODO: implement"
  });
};

export default useMockDispatcher;
