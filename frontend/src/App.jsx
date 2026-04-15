import React from "react";
import { DesignProvider } from "./context/DesignContext";
import Header       from "./components/Header/Header";
import Toolbar      from "./components/Toolbar/Toolbar";
import Sidebar      from "./components/Sidebar/Sidebar";
import CanvasEditor from "./components/Canvas/CanvasEditor";

export default function App() {
  return (
    <DesignProvider>
      <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
        {/* Top header bar */}
        <Header />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left toolbar */}
          <Toolbar />

          {/* Left sidebar */}
          <Sidebar />

          {/* Canvas workspace */}
          <main className="flex-1 relative overflow-hidden flex flex-col">
            <CanvasEditor />
          </main>
        </div>
      </div>
    </DesignProvider>
  );
}
