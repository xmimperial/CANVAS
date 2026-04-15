import { useEffect, useCallback, useRef } from "react";
import * as fabric from "fabric";
import { useDesign } from "../context/DesignContext";

export function useCanvas(canvasElRef) {
  const { state, dispatch, fabricRef, setSelectedObj, pushHistory } = useDesign();
  const autoSaveTimer = useRef(null);

  // ─── Initialize Fabric.js canvas ─────────────────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: state.canvasSize.width,
      height: state.canvasSize.height,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Selection events
    canvas.on("selection:created", (e) => setSelectedObj(e.selected?.[0] || null));
    canvas.on("selection:updated", (e) => setSelectedObj(e.selected?.[0] || null));
    canvas.on("selection:cleared",  () => setSelectedObj(null));

    // History tracking
    const trackChange = () => {
      pushHistory(canvas.toJSON(["id", "name", "gradientAngle"]));
    };

    canvas.on("object:added",    trackChange);
    canvas.on("object:modified", trackChange);
    canvas.on("object:removed",  trackChange);

    // Push initial state
    pushHistory(canvas.toJSON());

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Delete / Backspace
      if ((e.key === "Delete" || e.key === "Backspace") &&
          document.activeElement.tagName !== "INPUT" &&
          document.activeElement.tagName !== "TEXTAREA") {
        const active = canvas.getActiveObjects();
        active.forEach((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      // Undo  Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        // handled via context undo
      }

      // Copy  Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const active = canvas.getActiveObject();
        if (active) {
          active.clone().then((cloned) => {
            canvas._clipboard = cloned;
          });
        }
      }

      // Paste  Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (canvas._clipboard) {
          canvas._clipboard.clone().then((cloned) => {
            canvas.discardActiveObject();
            cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
            if (cloned.type === "activeSelection") {
              cloned.canvas = canvas;
              cloned.forEachObject((obj) => canvas.add(obj));
              cloned.setCoords();
            } else {
              canvas.add(cloned);
            }
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
          });
        }
      }

      // Nudge with arrow keys
      const active = canvas.getActiveObject();
      if (active) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowLeft")  { active.set("left", active.left - step); canvas.renderAll(); }
        if (e.key === "ArrowRight") { active.set("left", active.left + step); canvas.renderAll(); }
        if (e.key === "ArrowUp")    { active.set("top",  active.top  - step); canvas.renderAll(); }
        if (e.key === "ArrowDown")  { active.set("top",  active.top  + step); canvas.renderAll(); }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fabricRef]);

  // ─── Add elements ─────────────────────────────────────────────────────────────
  const addText = useCallback((options = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText(options.text || "Double-click to edit", {
      left:     canvas.width  / 2 - 100,
      top:      canvas.height / 2 - 20,
      fontSize: options.fontSize || 28,
      fontFamily: options.fontFamily || "Inter, sans-serif",
      fill:     options.fill || "#1a1a2e",
      fontWeight: options.fontWeight || "normal",
      ...options,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [fabricRef]);

  const addRect = useCallback((options = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left:   canvas.width  / 2 - 75,
      top:    canvas.height / 2 - 50,
      width:  150,
      height: 100,
      fill:   options.fill || "#6366f1",
      rx:     options.rx   || 4,
      ry:     options.ry   || 4,
      stroke: options.stroke || "transparent",
      strokeWidth: 0,
      ...options,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }, [fabricRef]);

  const addCircle = useCallback((options = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const circle = new fabric.Circle({
      left:   canvas.width  / 2 - 60,
      top:    canvas.height / 2 - 60,
      radius: 60,
      fill:   options.fill || "#f59e0b",
      ...options,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  }, [fabricRef]);

  const addTriangle = useCallback((options = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const tri = new fabric.Triangle({
      left:   canvas.width  / 2 - 60,
      top:    canvas.height / 2 - 60,
      width:  120,
      height: 100,
      fill:   options.fill || "#10b981",
      ...options,
    });
    canvas.add(tri);
    canvas.setActiveObject(tri);
    canvas.renderAll();
  }, [fabricRef]);

  const addLine = useCallback((options = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const line = new fabric.Line(
      [canvas.width / 2 - 100, canvas.height / 2, canvas.width / 2 + 100, canvas.height / 2],
      { stroke: options.stroke || "#1a1a2e", strokeWidth: options.strokeWidth || 3, ...options }
    );
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  }, [fabricRef]);

  const addImageFromURL = useCallback((url) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
      const scale = Math.min(
        (canvas.width  * 0.6) / img.width,
        (canvas.height * 0.6) / img.height
      );
      img.set({
        left:    canvas.width  / 2 - (img.width  * scale) / 2,
        top:     canvas.height / 2 - (img.height * scale) / 2,
        scaleX:  scale,
        scaleY:  scale,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  }, [fabricRef]);

  // ─── Layer management ─────────────────────────────────────────────────────────
  const bringForward  = useCallback(() => { const c = fabricRef.current; c?.bringObjectForward(c.getActiveObject()); c?.renderAll(); }, [fabricRef]);
  const sendBackward  = useCallback(() => { const c = fabricRef.current; c?.sendObjectBackwards(c.getActiveObject()); c?.renderAll(); }, [fabricRef]);
  const bringToFront  = useCallback(() => { const c = fabricRef.current; c?.bringObjectToFront(c.getActiveObject()); c?.renderAll(); }, [fabricRef]);
  const sendToBack    = useCallback(() => { const c = fabricRef.current; c?.sendObjectToBack(c.getActiveObject()); c?.renderAll(); }, [fabricRef]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  }, [fabricRef]);

  // ─── Export ───────────────────────────────────────────────────────────────────
  const exportPNG = useCallback((multiplier = 2) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataURL = canvas.toDataURL({ format: "png", multiplier, quality: 1 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "design.png";
    link.click();
  }, [fabricRef]);

  const exportJPG = useCallback((multiplier = 2) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataURL = canvas.toDataURL({ format: "jpeg", multiplier, quality: 0.95 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "design.jpg";
    link.click();
  }, [fabricRef]);

  // ─── Thumbnail ────────────────────────────────────────────────────────────────
  const getThumbnail = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return "";
    return canvas.toDataURL({ format: "jpeg", multiplier: 0.3, quality: 0.7 });
  }, [fabricRef]);

  // ─── Load from JSON ───────────────────────────────────────────────────────────
  const loadFromJSON = useCallback((json) => {
    const canvas = fabricRef.current;
    if (!canvas || !json) return;
    canvas.loadFromJSON(json).then(() => canvas.renderAll());
  }, [fabricRef]);

  // ─── Update object properties ─────────────────────────────────────────────────
  const updateActiveObject = useCallback((props) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.set(props);
    canvas.renderAll();
    // update selectedObject snapshot
    setSelectedObj({ ...active.toObject(), ...props });
  }, [fabricRef, setSelectedObj]);

  // ─── Background ───────────────────────────────────────────────────────────────
  const setBackground = useCallback((color) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.set("backgroundColor", color);
    canvas.renderAll();
  }, [fabricRef]);

  // ─── Zoom ─────────────────────────────────────────────────────────────────────
  const zoomIn  = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const z = Math.min(canvas.getZoom() * 1.1, 5);
    canvas.setZoom(z);
    dispatch({ type: "SET_ZOOM", payload: Math.round(z * 100) });
  }, [fabricRef, dispatch]);

  const zoomOut = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const z = Math.max(canvas.getZoom() / 1.1, 0.1);
    canvas.setZoom(z);
    dispatch({ type: "SET_ZOOM", payload: Math.round(z * 100) });
  }, [fabricRef, dispatch]);

  const zoomReset = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(1);
    dispatch({ type: "SET_ZOOM", payload: 100 });
  }, [fabricRef, dispatch]);

  return {
    addText, addRect, addCircle, addTriangle, addLine,
    addImageFromURL,
    bringForward, sendBackward, bringToFront, sendToBack,
    deleteSelected,
    exportPNG, exportJPG,
    getThumbnail,
    loadFromJSON,
    updateActiveObject,
    setBackground,
    zoomIn, zoomOut, zoomReset,
  };
}
