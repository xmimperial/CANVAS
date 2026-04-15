import React, { useState } from "react";
import {
  MousePointer2, Type, Square, Circle, Triangle,
  Minus, Image, ZoomIn, ZoomOut, RotateCcw, RotateCw,
  Trash2, Download, ChevronUp, ChevronDown,
} from "lucide-react";
import { useDesign } from "../../context/DesignContext";
import { useCanvas } from "../../hooks/useCanvas";

const ToolButton = ({ icon: Icon, label, active, onClick, className = "" }) => (
  <button
    title={label}
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs transition-all
      ${active
        ? "bg-brand-600 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${className}`}
  >
    <Icon size={18} strokeWidth={1.8} />
    <span className="hidden sm:block leading-none">{label}</span>
  </button>
);

export default function Toolbar() {
  const { state, setActiveTool } = useDesign();
  const {
    addText, addRect, addCircle, addTriangle, addLine,
    deleteSelected, bringForward, sendBackward,
    exportPNG, exportJPG,
    zoomIn, zoomOut, zoomReset,
  } = useCanvas(React.useRef(null));   // fabricRef is shared via context

  const [showExport, setShowExport] = useState(false);

  const tools = [
    { id: "select",   icon: MousePointer2, label: "Select",   action: () => setActiveTool("select") },
    { id: "text",     icon: Type,          label: "Text",     action: () => { setActiveTool("text");     addText(); } },
    { id: "rect",     icon: Square,        label: "Rect",     action: () => { setActiveTool("rect");     addRect(); } },
    { id: "circle",   icon: Circle,        label: "Circle",   action: () => { setActiveTool("circle");   addCircle(); } },
    { id: "triangle", icon: Triangle,      label: "Triangle", action: () => { setActiveTool("triangle"); addTriangle(); } },
    { id: "line",     icon: Minus,         label: "Line",     action: () => { setActiveTool("line");     addLine(); } },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-sm w-[72px] items-center py-3 gap-1">
      {/* Drawing tools */}
      <div className="flex flex-col gap-1 w-full px-2">
        {tools.map((t) => (
          <ToolButton
            key={t.id}
            icon={t.icon}
            label={t.label}
            active={state.activeTool === t.id}
            onClick={t.action}
          />
        ))}
      </div>

      <hr className="w-8 border-gray-200 my-1" />

      {/* Layer order */}
      <ToolButton icon={ChevronUp}   label="Fwd"   onClick={bringForward} />
      <ToolButton icon={ChevronDown} label="Back"  onClick={sendBackward} />

      <hr className="w-8 border-gray-200 my-1" />

      {/* Zoom */}
      <ToolButton icon={ZoomIn}    label="In"    onClick={zoomIn} />
      <ToolButton icon={ZoomOut}   label="Out"   onClick={zoomOut} />
      <ToolButton icon={RotateCcw} label="100%"  onClick={zoomReset} />

      <hr className="w-8 border-gray-200 my-1" />

      {/* Delete */}
      <ToolButton
        icon={Trash2}
        label="Delete"
        onClick={deleteSelected}
        className="!text-red-500 hover:!bg-red-50"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export */}
      <div className="relative w-full px-2">
        <button
          onClick={() => setShowExport((v) => !v)}
          className="w-full flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs
            bg-brand-600 text-white hover:bg-brand-700 transition-all"
        >
          <Download size={18} />
          <span className="hidden sm:block">Export</span>
        </button>

        {showExport && (
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
            bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 w-32">
            <button
              onClick={() => { exportPNG(2); setShowExport(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              📥 PNG (2×)
            </button>
            <button
              onClick={() => { exportPNG(4); setShowExport(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              📥 PNG (4×)
            </button>
            <button
              onClick={() => { exportJPG(2); setShowExport(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              📥 JPG (2×)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
