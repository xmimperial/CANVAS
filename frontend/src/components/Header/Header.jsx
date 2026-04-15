import React, { useState } from "react";
import { Save, FolderOpen, Undo2, Redo2, Loader2, CheckCircle } from "lucide-react";
import { useDesign } from "../../context/DesignContext";
import { useCanvas } from "../../hooks/useCanvas";
import { saveDesign, updateDesign, getAllDesigns } from "../../services/api";

export default function Header() {
  const { state, dispatch, setDesignName, undo, redo, fabricRef } = useDesign();
  const { getThumbnail, loadFromJSON } = useCanvas(React.useRef(null));

  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [showLoad, setShowLoad]     = useState(false);
  const [designs,  setDesigns]      = useState([]);

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    setSaveStatus("saving");
    try {
      const canvasJSON  = canvas.toJSON(["id", "name"]);
      const thumbnail   = getThumbnail();
      const payload = {
        name:       state.designName,
        canvasJSON,
        thumbnail,
        canvasSize: state.canvasSize,
        elements:   canvas.getObjects().map((o) => ({
          type: o.type,
          fabricData: o.toObject(),
        })),
      };

      if (state.designId) {
        await updateDesign(state.designId, payload);
      } else {
        const { data } = await saveDesign(payload);
        dispatch({ type: "SET_DESIGN_ID", payload: data.design._id });
      }

      setSaveStatus("saved");
      dispatch({ type: "SET_IS_DIRTY", payload: false });
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // ─── Load ─────────────────────────────────────────────────────────────────────
  const handleOpenLoad = async () => {
    try {
      const { data } = await getAllDesigns();
      setDesigns(data.designs || []);
      setShowLoad(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadDesign = (design) => {
    loadFromJSON(design.canvasJSON);
    dispatch({ type: "SET_DESIGN_ID",   payload: design._id });
    dispatch({ type: "SET_DESIGN_NAME", payload: design.name });
    setShowLoad(false);
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center
        px-4 gap-3 shadow-sm z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-gray-800 text-lg hidden sm:block">DesignX</span>
        </div>

        {/* Design name */}
        <input
          value={state.designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-transparent
            rounded-lg hover:border-gray-200 focus:outline-none focus:border-brand-400
            bg-gray-50 focus:bg-white transition-all w-48"
          placeholder="Design name..."
        />

        {/* Dirty indicator */}
        {state.isDirty && (
          <span className="text-xs text-amber-500 font-medium">Unsaved</span>
        )}

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={state.historyIndex <= 0}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100
            disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={redo}
          disabled={state.historyIndex >= state.history.length - 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100
            disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Redo"
        >
          <Redo2 size={18} />
        </button>

        {/* Load */}
        <button
          onClick={handleOpenLoad}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
            text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
        >
          <FolderOpen size={16} /> Open
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium
            transition-all shadow-sm
            ${saveStatus === "saved"
              ? "bg-green-500 text-white"
              : saveStatus === "error"
              ? "bg-red-500 text-white"
              : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
        >
          {saveStatus === "saving" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveStatus === "saved" ? (
            <CheckCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saveStatus === "saving" ? "Saving…"
            : saveStatus === "saved"  ? "Saved!"
            : saveStatus === "error"  ? "Error!"
            : "Save"}
        </button>
      </header>

      {/* Load designs modal */}
      {showLoad && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLoad(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh]
              overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-lg">My Designs</h2>
              <button onClick={() => setShowLoad(false)}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {designs.length === 0 ? (
                <div className="col-span-3 text-center text-gray-400 py-12">
                  No saved designs found
                </div>
              ) : (
                designs.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => handleLoadDesign(d)}
                    className="group border-2 border-gray-100 hover:border-brand-500
                      rounded-xl overflow-hidden transition-all text-left"
                  >
                    <div className="aspect-video bg-gray-50 overflow-hidden">
                      {d.thumbnail ? (
                        <img src={d.thumbnail} alt={d.name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center
                          text-gray-300 text-xs">No preview</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-700 truncate">{d.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(d.updatedAt || d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
