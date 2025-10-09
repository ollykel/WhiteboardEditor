import {
  useState
} from 'react';

import Konva from 'konva';

import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectIdType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

// === useHandDispatcher =======================================================
// 
// Dispatcher for the Hand tool. Unlike other tools, doesn't generate a preview
// or render shapes.
//
// =============================================================================
const useHandDispatcher = (_props: OperationDispatcherProps): OperationDispatcher => {
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  return ({
    handlePointerDown: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      setIsMouseDown(true);
    },
    handlePointerMove: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      // Nothing to do
    },
    handlePointerUp: (ev: Konva.KonvaEventObject<MouseEvent>) => {
      ev.cancelBubble = true;
      setIsMouseDown(false);
    },
    getPreview: () => null,
    renderShape: (
      _key: string | number,
      _model: CanvasObjectModel,
      _isDraggable: boolean,
      _handleUpdateShapes: (shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => void
    ) => null,
    getTooltipText: () => isMouseDown ? "Drag shape(s) to desired location" : "Grab a shape to move its location"
  });
};

export default useHandDispatcher;
