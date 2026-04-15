import React from "react";
import { HexColorPicker } from "react-colorful";
import { useDesign } from "../../context/DesignContext";
import { useCanvas } from "../../hooks/useCanvas";

const FONT_FAMILIES = [
  "Inter", "Georgia", "Times New Roman", "Courier New",
  "Arial", "Verdana", "Impact", "Comic Sans MS",
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

export default function StylePanel() {
  const { state } = useDesign();
  const { updateActiveObject, setBackground } = useCanvas(React.useRef(null));
  const obj = state.selectedObject;

  const [showFill, setShowFill]   = React.useState(false);
  const [showStroke, setShowStroke] = React.useState(false);
  const [showBg, setShowBg]       = React.useState(false);
  const [bgColor, setBgColor]     = React.useState("#ffffff");

  const handleBgChange = (color) => {
    setBgColor(color);
    setBackground(color);
  };

  if (!obj) {
    return (
      <div className="p-5 h-full overflow-y-auto space-y-5">
        {/* Canvas background */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Canvas Background
          </h3>
          <button
            onClick={() => setShowBg((v) => !v)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200
              hover:border-brand-400 transition-all"
          >
            <div
              className="w-7 h-7 rounded-lg border-2 border-white shadow-md"
              style={{ backgroundColor: bgColor }}
            />
            <span className="text-sm text-gray-700">{bgColor}</span>
          </button>
          {showBg && (
            <div className="mt-3">
              <HexColorPicker color={bgColor} onChange={handleBgChange} className="!w-full" />
            </div>
          )}
        </section>

        <div className="flex items-center justify-center h-32 text-gray-400 text-sm text-center">
          Select an object to<br />edit its styles
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      {/* Object type badge */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-xs font-medium capitalize">
          {obj.type || "object"}
        </span>
        <span className="text-xs text-gray-400">selected</span>
      </div>

      {/* Fill Color */}
      {(obj.type !== "line") && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fill</h3>
          <button
            onClick={() => setShowFill((v) => !v)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200
              hover:border-brand-400 transition-all"
          >
            <div
              className="w-7 h-7 rounded-lg border-2 border-white shadow-md"
              style={{ backgroundColor: obj.fill || "#transparent" }}
            />
            <span className="text-sm text-gray-700">{obj.fill || "none"}</span>
          </button>
          {showFill && (
            <div className="mt-3">
              <HexColorPicker
                color={typeof obj.fill === "string" ? obj.fill : "#000000"}
                onChange={(c) => updateActiveObject({ fill: c })}
                className="!w-full"
              />
            </div>
          )}
        </section>
      )}

      {/* Stroke */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stroke</h3>
        <button
          onClick={() => setShowStroke((v) => !v)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200
            hover:border-brand-400 transition-all"
        >
          <div
            className="w-7 h-7 rounded-lg border-4"
            style={{ borderColor: obj.stroke || "#ccc", backgroundColor: "transparent" }}
          />
          <span className="text-sm text-gray-700">{obj.stroke || "none"}</span>
        </button>
        {showStroke && (
          <div className="mt-3 space-y-3">
            <HexColorPicker
              color={obj.stroke || "#000000"}
              onChange={(c) => updateActiveObject({ stroke: c })}
              className="!w-full"
            />
            <label className="block text-xs text-gray-500">
              Stroke Width: {obj.strokeWidth || 0}px
              <input
                type="range" min={0} max={20}
                value={obj.strokeWidth || 0}
                onChange={(e) => updateActiveObject({ strokeWidth: Number(e.target.value) })}
                className="w-full mt-1 accent-brand-600"
              />
            </label>
          </div>
        )}
      </section>

      {/* Opacity */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Opacity: {Math.round((obj.opacity ?? 1) * 100)}%
        </h3>
        <input
          type="range" min={0} max={1} step={0.01}
          value={obj.opacity ?? 1}
          onChange={(e) => updateActiveObject({ opacity: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
      </section>

      {/* Border Radius (Rect only) */}
      {obj.type === "rect" && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Corner Radius: {obj.rx || 0}px
          </h3>
          <input
            type="range" min={0} max={100}
            value={obj.rx || 0}
            onChange={(e) => updateActiveObject({ rx: Number(e.target.value), ry: Number(e.target.value) })}
            className="w-full accent-brand-600"
          />
        </section>
      )}

      {/* Shadow */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shadow</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!obj.shadow}
            onChange={(e) =>
              updateActiveObject({
                shadow: e.target.checked
                  ? { color: "rgba(0,0,0,0.3)", blur: 15, offsetX: 4, offsetY: 4 }
                  : null,
              })
            }
            className="accent-brand-600"
          />
          Enable shadow
        </label>
      </section>

      {/* Text properties */}
      {(obj.type === "i-text" || obj.type === "text") && (
        <section className="space-y-3 border-t border-gray-100 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Typography</h3>

          {/* Font family */}
          <select
            value={obj.fontFamily || "Inter"}
            onChange={(e) => updateActiveObject({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
              focus:outline-none focus:border-brand-500"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>

          {/* Font size */}
          <select
            value={obj.fontSize || 20}
            onChange={(e) => updateActiveObject({ fontSize: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
              focus:outline-none focus:border-brand-500"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>

          {/* Font style toggles */}
          <div className="flex gap-2">
            {[
              { label: "B",  prop: "fontWeight",  on: "bold",   off: "normal", style: "font-bold" },
              { label: "I",  prop: "fontStyle",   on: "italic", off: "normal", style: "italic" },
              { label: "U",  prop: "underline",   on: true,     off: false,    style: "underline" },
            ].map(({ label, prop, on, off, style }) => (
              <button
                key={label}
                onClick={() => updateActiveObject({ [prop]: obj[prop] === on ? off : on })}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${style}
                  ${obj[prop] === on
                    ? "bg-brand-600 text-white border-brand-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Text align */}
          <div className="flex gap-1">
            {["left", "center", "right"].map((align) => (
              <button
                key={align}
                onClick={() => updateActiveObject({ textAlign: align })}
                className={`flex-1 py-1.5 rounded-lg text-xs border transition-all
                  ${obj.textAlign === align
                    ? "bg-brand-100 text-brand-700 border-brand-300"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {align === "left" ? "⬅" : align === "center" ? "↔" : "➡"}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Position & Size */}
      <section className="border-t border-gray-100 pt-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Position & Size
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "X", prop: "left" },
            { label: "Y", prop: "top"  },
            { label: "W", prop: "width" },
            { label: "H", prop: "height" },
          ].map(({ label, prop }) => (
            <label key={prop} className="flex flex-col gap-1">
              <span className="text-gray-500">{label}</span>
              <input
                type="number"
                value={Math.round(obj[prop] || 0)}
                onChange={(e) => updateActiveObject({ [prop]: Number(e.target.value) })}
                className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs
                  focus:outline-none focus:border-brand-500"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
