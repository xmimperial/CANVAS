import React from "react";
import { Layers, Layout, Sliders } from "lucide-react";
import { useDesign } from "../../context/DesignContext";
import ElementsPanel  from "./ElementsPanel";
import TemplatesPanel from "./TemplatesPanel";
import StylePanel     from "./StylePanel";

const TABS = [
  { id: "elements",  icon: Layers,  label: "Elements"  },
  { id: "templates", icon: Layout,  label: "Templates" },
  { id: "styles",    icon: Sliders, label: "Styles"    },
];

export default function Sidebar() {
  const { state, setActivePanel } = useDesign();

  return (
    <div className="flex h-full">
      {/* Tab rail */}
      <div className="flex flex-col items-center bg-gray-50 border-r border-gray-200
        w-14 py-3 gap-1">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            title={label}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl w-full
              text-xs transition-all
              ${state.activePanel === id
                ? "bg-white text-brand-600 shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
              }`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span className="leading-none text-[10px]">{label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 w-[220px] bg-white overflow-hidden">
        {state.activePanel === "elements"  && <ElementsPanel  />}
        {state.activePanel === "templates" && <TemplatesPanel />}
        {state.activePanel === "styles"    && <StylePanel     />}
      </div>
    </div>
  );
}
