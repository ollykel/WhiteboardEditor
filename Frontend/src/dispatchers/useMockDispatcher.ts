import Konva from 'konva';

import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

// === useMockDispatcher =======================================================
// Use as a dummy for unimplemented functionalities.
//
// =============================================================================
const useMockDispatcher = (_props: OperationDispatcherProps): OperationDispatcher => {
  return ({
    handlePointerDown: (_ev: Konva.KonvaEventObject<MouseEvent>) => {
      console.log('TODO: implement');
    },
    handlePointerMove: (_ev: Konva.KonvaEventObject<MouseEvent>) => {
      console.log('TODO: implement');
    },
    handlePointerUp: (_ev: Konva.KonvaEventObject<MouseEvent>) => {
      console.log('TODO: implement');
    },
    getPreview: () => null,
    renderShape: (
      _key: string | number,
      _model: CanvasObjectModel
    ) => null,
    getTooltipText: () => "TODO: implement"
  });
};

export default useMockDispatcher;
