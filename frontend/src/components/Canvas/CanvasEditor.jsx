import React, { useRef, useEffect } from "react";
import { useDesign } from "../../context/DesignContext";
import { useCanvas } from "../../hooks/useCanvas";

export default function CanvasEditor() {
  const canvasElRef = useRef(null);
  const { state } = useDesign();

  // Initialize all canvas operations
  useCanvas(canvasElRef);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-auto">
      {/* Zoom + size info */}
      <div className="absolute top-3 right-4 text-xs text-gray-400 select-none z-10">
        {state.canvasSize.width} × {state.canvasSize.height}px · {state.zoom}%
      </div>

      {/* Drop shadow to simulate paper */}
      <div
        className="relative shadow-2xl"
        style={{
          width:  state.canvasSize.width  * (state.zoom / 100),
          height: state.canvasSize.height * (state.zoom / 100),
        }}
      >
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
