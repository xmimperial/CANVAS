import React, { useState } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { useDesign } from "../../context/DesignContext";

const CATEGORIES = ["All", "Social Media", "Poster", "Logo", "Presentation"];

// Pre-built templates (lightweight Fabric.js JSON)
const TEMPLATES = [
  {
    id: "t1",
    name: "Purple Gradient Post",
    category: "Social Media",
    bg: "linear-gradient(135deg,#667eea,#764ba2)",
    canvasJSON: {
      version: "6.0.0",
      objects: [
        {
          type: "Rect",
          left: 0, top: 0, width: 800, height: 600,
          fill: "#667eea", selectable: false,
        },
        {
          type: "IText",
          left: 200, top: 220,
          text: "YOUR BRAND", fontSize: 54, fontWeight: "bold",
          fill: "#ffffff", fontFamily: "Inter",
        },
        {
          type: "IText",
          left: 260, top: 300,
          text: "Tagline goes here", fontSize: 22,
          fill: "rgba(255,255,255,0.8)", fontFamily: "Inter",
        },
      ],
    },
  },
  {
    id: "t2",
    name: "Minimal White Card",
    category: "Poster",
    bg: "#f8fafc",
    canvasJSON: {
      version: "6.0.0",
      objects: [
        {
          type: "Rect",
          left: 50, top: 50, width: 700, height: 500,
          fill: "#ffffff", rx: 16, ry: 16,
          shadow: { color: "rgba(0,0,0,0.1)", blur: 30, offsetX: 0, offsetY: 8 },
        },
        {
          type: "IText",
          left: 130, top: 200,
          text: "Clean Design", fontSize: 48, fontWeight: "700",
          fill: "#1a1a2e", fontFamily: "Inter",
        },
        {
          type: "IText",
          left: 130, top: 270,
          text: "Subtitle here", fontSize: 20,
          fill: "#64748b", fontFamily: "Inter",
        },
        {
          type: "Rect",
          left: 130, top: 330, width: 150, height: 48,
          fill: "#6366f1", rx: 8, ry: 8,
        },
      ],
    },
  },
  {
    id: "t3",
    name: "Bold Sale Banner",
    category: "Social Media",
    bg: "#ef4444",
    canvasJSON: {
      version: "6.0.0",
      objects: [
        {
          type: "Rect",
          left: 0, top: 0, width: 800, height: 600,
          fill: "#ef4444",
        },
        {
          type: "IText",
          left: 160, top: 160,
          text: "50% OFF", fontSize: 96, fontWeight: "900",
          fill: "#ffffff", fontFamily: "Inter",
        },
        {
          type: "IText",
          left: 260, top: 300,
          text: "Limited Time Offer", fontSize: 24,
          fill: "rgba(255,255,255,0.9)", fontFamily: "Inter",
        },
      ],
    },
  },
  {
    id: "t4",
    name: "Dark Logo Design",
    category: "Logo",
    bg: "#0f172a",
    canvasJSON: {
      version: "6.0.0",
      objects: [
        {
          type: "Rect",
          left: 0, top: 0, width: 800, height: 600,
          fill: "#0f172a",
        },
        {
          type: "Circle",
          left: 350, top: 210,
          radius: 60,
          fill: "#6366f1",
        },
        {
          type: "IText",
          left: 295, top: 310,
          text: "YOUR LOGO", fontSize: 28, fontWeight: "bold",
          fill: "#ffffff", fontFamily: "Inter", letterSpacing: 8,
        },
      ],
    },
  },
];

export default function TemplatesPanel() {
  const [active, setActive] = useState("All");
  const { loadFromJSON } = useCanvas(React.useRef(null));
  const { dispatch } = useDesign();

  const filtered = active === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === active);

  const applyTemplate = (template) => {
    if (window.confirm(`Apply template "${template.name}"? This will replace current design.`)) {
      loadFromJSON(template.canvasJSON);
      dispatch({ type: "SET_DESIGN_NAME", payload: template.name });
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all
              ${active === c
                ? "bg-brand-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => applyTemplate(t)}
            className="group relative rounded-xl overflow-hidden border-2 border-gray-100
              hover:border-brand-500 transition-all shadow-sm hover:shadow-md"
          >
            {/* Thumbnail preview */}
            <div
              style={{ background: t.bg }}
              className="w-full aspect-video flex items-center justify-center text-white
                text-xs font-medium"
            >
              <span className="opacity-80 text-center px-2">{t.name}</span>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-brand-600/80 opacity-0 group-hover:opacity-100
              transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Apply →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
