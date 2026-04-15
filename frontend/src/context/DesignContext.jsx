import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState = {
  designId: null,
  designName: "Untitled Design",
  canvasSize: { width: 800, height: 600 },
  activeTool: "select",          // select | text | rect | circle | triangle | line
  activePanel: "elements",       // elements | templates | styles
  selectedObject: null,
  history: [],
  historyIndex: -1,
  isSaving: false,
  isDirty: false,
  zoom: 1,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "SET_DESIGN_ID":       return { ...state, designId: action.payload };
    case "SET_DESIGN_NAME":     return { ...state, designName: action.payload };
    case "SET_CANVAS_SIZE":     return { ...state, canvasSize: action.payload };
    case "SET_ACTIVE_TOOL":     return { ...state, activeTool: action.payload };
    case "SET_ACTIVE_PANEL":    return { ...state, activePanel: action.payload };
    case "SET_SELECTED_OBJECT": return { ...state, selectedObject: action.payload };
    case "SET_IS_SAVING":       return { ...state, isSaving: action.payload };
    case "SET_IS_DIRTY":        return { ...state, isDirty: action.payload };
    case "SET_ZOOM":            return { ...state, zoom: action.payload };
    case "PUSH_HISTORY": {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action.payload);
      return {
        ...state,
        history: newHistory.slice(-50),       // keep last 50 states
        historyIndex: Math.min(newHistory.length - 1, 49),
        isDirty: true,
      };
    }
    case "UNDO":
      return {
        ...state,
        historyIndex: Math.max(state.historyIndex - 1, 0),
      };
    case "REDO":
      return {
        ...state,
        historyIndex: Math.min(state.historyIndex + 1, state.history.length - 1),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DesignContext = createContext(null);

export function DesignProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fabricRef = useRef(null);           // holds the Fabric.js canvas instance

  const setActiveTool   = useCallback((t) => dispatch({ type: "SET_ACTIVE_TOOL", payload: t }), []);
  const setActivePanel  = useCallback((p) => dispatch({ type: "SET_ACTIVE_PANEL", payload: p }), []);
  const setSelectedObj  = useCallback((o) => dispatch({ type: "SET_SELECTED_OBJECT", payload: o }), []);
  const setDesignName   = useCallback((n) => dispatch({ type: "SET_DESIGN_NAME", payload: n }), []);
  const setZoom         = useCallback((z) => dispatch({ type: "SET_ZOOM", payload: z }), []);
  const pushHistory     = useCallback((json) => dispatch({ type: "PUSH_HISTORY", payload: json }), []);
  const undo            = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo            = useCallback(() => dispatch({ type: "REDO" }), []);

  return (
    <DesignContext.Provider
      value={{
        state,
        dispatch,
        fabricRef,
        setActiveTool,
        setActivePanel,
        setSelectedObj,
        setDesignName,
        setZoom,
        pushHistory,
        undo,
        redo,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export const useDesign = () => {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used inside DesignProvider");
  return ctx;
};
