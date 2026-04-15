import React, { useRef } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { uploadImage } from "../../services/api";

const ICONS = [
  { emoji: "⭐", label: "Star" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "⚡", label: "Lightning" },
  { emoji: "🎨", label: "Palette" },
  { emoji: "💡", label: "Idea" },
  { emoji: "🚀", label: "Rocket" },
  { emoji: "🏆", label: "Trophy" },
];

const COLORS = [
  "#6366f1","#f59e0b","#10b981","#ef4444",
  "#3b82f6","#ec4899","#14b8a6","#f97316",
  "#8b5cf6","#06b6d4","#84cc16","#1a1a2e",
];

export default function ElementsPanel() {
  const fileRef = useRef();
  const { addText, addRect, addCircle, addTriangle, addLine, addImageFromURL } =
    useCanvas(useRef(null));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { data } = await uploadImage(file);
      addImageFromURL(data.url);
    } catch {
      // fallback to local object URL
      addImageFromURL(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      {/* Shapes */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shapes</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Rectangle", fn: () => addRect() },
            { label: "Circle",    fn: () => addCircle() },
            { label: "Triangle",  fn: () => addTriangle() },
            { label: "Line",      fn: () => addLine() },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="flex flex-col items-center justify-center p-3 rounded-xl
                border-2 border-dashed border-gray-200 hover:border-brand-500
                hover:bg-brand-50 text-xs text-gray-600 hover:text-brand-600
                transition-all font-medium gap-1"
            >
              <span className="text-lg">
                {label === "Rectangle" ? "▬"
                  : label === "Circle"   ? "●"
                  : label === "Triangle" ? "▲"
                  : "─"}
              </span>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Text styles */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Text</h3>
        <div className="space-y-1.5">
          {[
            { label: "Heading",    opts: { text: "Heading",    fontSize: 40, fontWeight: "bold"   } },
            { label: "Subheading", opts: { text: "Subheading", fontSize: 28, fontWeight: "600"    } },
            { label: "Body Text",  opts: { text: "Body text",  fontSize: 18, fontWeight: "normal" } },
            { label: "Caption",    opts: { text: "Caption",    fontSize: 13, fontWeight: "normal" } },
          ].map(({ label, opts }) => (
            <button
              key={label}
              onClick={() => addText(opts)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-50
                hover:text-brand-700 text-sm text-gray-700 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Quick colors */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Colors</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => addRect({ fill: c })}
              style={{ backgroundColor: c }}
              className="w-7 h-7 rounded-full border-2 border-white shadow-md
                hover:scale-110 transition-transform"
              title={c}
            />
          ))}
        </div>
      </section>

      {/* Icons (emoji-based) */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Icons</h3>
        <div className="grid grid-cols-4 gap-2">
          {ICONS.map(({ emoji, label }) => (
            <button
              key={label}
              onClick={() => addText({ text: emoji, fontSize: 48 })}
              className="p-2 rounded-xl border border-gray-100 hover:border-brand-400
                hover:bg-brand-50 text-2xl transition-all"
              title={label}
            >
              {emoji}
            </button>
          ))}
        </div>
      </section>

      {/* Image upload */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Images</h3>
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-brand-300
            rounded-xl text-brand-600 hover:bg-brand-50 text-sm font-medium
            transition-all flex items-center justify-center gap-2"
        >
          📁 Upload Image
        </button>
      </section>
    </div>
  );
}
