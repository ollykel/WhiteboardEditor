import type Konva from "konva";

import { 
  type RefObject, 
} from "react";

import {
  KONVA_NODE_UI_ONLY_KEY,
} from '@/app.config';

import type { CanvasIdType } from "@/types/WebSocketProtocol";

export type ImageTypeEnum =
  | 'jpeg'
  | 'png'
;

export const captureImage = (
  canvasGroupRefsByIdRef: RefObject<Record<CanvasIdType, RefObject<Konva.Group | null>>>, 
  canvasId: string, 
  imageType: ImageTypeEnum,
  quality: number,
): string => {
  const canvasGroupRef : RefObject<Konva.Group | null> | undefined = canvasGroupRefsByIdRef.current[canvasId];
  
  if (! canvasGroupRef?.current) {
    console.error('Could not find ref to Canvas with id', canvasId);
    alert('Error exporting Canvas');

    return "";
  } else {
    // -- create a clone of the Canvas group that excludes UI-only elements
    //    such as borders and tooltips.
    const exportableCanvas : Konva.Container = canvasGroupRef.current.clone();

    const isNodeContainer = (node: Konva.Node): node is Konva.Container => node.hasChildren();

    const destroyUIOnlyDescendants = (node: Konva.Node) => {
      if (isNodeContainer(node)) {
        for (const child of node.getChildren()) {
          if (child.hasName(KONVA_NODE_UI_ONLY_KEY)) {
            child.destroy();
          } else {
            destroyUIOnlyDescendants(child);
          }
        }// -- end for child
      }
    };// -- end destroyUIOnlyDescendants

    // -- filter out UI-only nodes
    destroyUIOnlyDescendants(exportableCanvas);

    // skip the first child, it's the canvas itself
    const children = exportableCanvas.getChildren().slice(1);

    // get the bounds of the child shapes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    children.forEach(child => {
      const box = child.getClientRect({ skipShadow: true, skipStroke: false });
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    });

    const exportUrl = exportableCanvas.toDataURL({
      mimeType: `image/${imageType}`,
      quality,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });

    // -- destroy temporary exportable canvas node
    exportableCanvas.destroy(); 

    return exportUrl;
  }
}