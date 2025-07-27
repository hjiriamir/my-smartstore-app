"use client"

import { useFloorPlanEditor } from "@/_hooks/use-floor-plan-editor"
import { FloorPlanCanvas } from "@/components/editor2D/floor-plan/floor-plan-canvas"
import { FloorPlan3DViewer } from "@/components/editor2D/floor-plan/floor-plan-3d-viewer"
import { FloorPlanSidebar } from "@/components/editor2D/floor-plan/floor-plan-sidebar"
import { FloorPlanToolbar } from "@/components/editor2D/floor-plan/floor-plan-toolbar"
import { FloorPlanControls } from "@/components/editor2D/floor-plan/floor-plan-controls"
import { SavePlanDialog } from "@/components/editor2D/floor-plan/save-plan-dialog"
import { PanelLeft } from "@/components/editor2D/floor-plan/icons"

export default function FloorPlanEditor() {
  const {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    currentTool,
    setCurrentTool,
    viewMode,
    setViewMode,
    zoom,
    offset,
    snapToGrid,
    gridSize,
    ghostElement,
    unitSystem,
    showDimensions,
    moveMode,
    sidebarVisible,
    setSidebarVisible,
    showSaveDialog,
    setShowSaveDialog,
    planName,
    setPlanName,
    canvasRef,
    threeViewerRef,
    selectedElementData,
    selectTool,
    calculatePlanCenter,
    centerView,
    handleCanvasClick,
    handleElementDragStart,
    handleCanvasDragStart,
    handleMouseMove,
    handleMouseUp,
    startResize,
    startRotate,
    handleZoom,
    updateElementDepth,
    deleteSelectedElement,
    exportToJSON,
    importFromJSON,
    exportToImage,
    exportToPDF,
    handleSaveFloorPlan,
    setSnapToGrid,
    setShowDimensions,
    setUnitSystem,
    setMoveMode,
  } = useFloorPlanEditor()

  return (
    <div className="h-screen flex flex-col mt-12">
      {/* Toolbar responsive */}
      <FloorPlanToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        exportToImage={exportToImage}
        exportToPDF={exportToPDF}
        exportToJSON={exportToJSON}
        importFromJSON={importFromJSON}
        setShowSaveDialog={setShowSaveDialog}
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
      />

      {/* Container principal */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Overlay pour mobile quand sidebar ouvert */}
        {sidebarVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarVisible(false)}
          />
        )}

        {/* Sidebar responsive avec transition fluide */}
        <div
          className={`
            ${sidebarVisible ? "translate-x-0" : "-translate-x-full"}
            fixed lg:relative top-0 left-0 h-full
            w-80 sm:w-96
            bg-gray-50 border-r shadow-lg lg:shadow-none
            transition-all duration-300 ease-in-out
            z-40 lg:z-auto
            overflow-y-auto
            lg:translate-x-0
            ${!sidebarVisible ? "lg:-translate-x-full lg:w-0" : ""}
          `}
        >
          <FloorPlanSidebar
            sidebarVisible={sidebarVisible}
            setSidebarVisible={setSidebarVisible}
            currentTab={
              currentTool === "wall" || currentTool === "door" || currentTool === "window"
                ? "structures"
                : currentTool === "line" || currentTool === "rectangle" || currentTool === "circle"
                  ? "shapes"
                  : "furniture"
            }
            setCurrentTab={(tab) => {
              if (tab === "structures") {
                setCurrentTool("wall")
              } else if (tab === "shapes") {
                setCurrentTool("line")
              } else {
                setCurrentTool("shelf")
              }
            }}
            selectTool={selectTool}
            currentTool={currentTool}
            selectedElementData={selectedElementData}
            setElements={setElements}
            selectedElement={selectedElement}
            updateElementDepth={updateElementDepth}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            showDimensions={showDimensions}
            setShowDimensions={setShowDimensions}
            unitSystem={unitSystem}
            setUnitSystem={setUnitSystem}
            deleteSelectedElement={deleteSelectedElement}
          />
        </div>

        {/* Zone d'édition avec expansion automatique */}
        <div
          className={`
            flex-1 relative overflow-hidden bg-gray-100 
            transition-all duration-300 ease-in-out
            ${!sidebarVisible ? "lg:ml-0" : ""}
          `}
        >
          {/* Bouton flottant pour ouvrir sidebar quand masqué - seulement sur mobile */}
          {!sidebarVisible && (
            <button
              className="absolute top-4 left-4 z-20 bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-200 border border-gray-200 lg:hidden"
              onClick={() => setSidebarVisible(true)}
            >
              <PanelLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}

          {/* Contrôles de l'éditeur */}
          <FloorPlanControls
            handleZoom={handleZoom}
            moveMode={moveMode}
            setMoveMode={setMoveMode}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            centerView={centerView}
            sidebarVisible={sidebarVisible}
            setSidebarVisible={setSidebarVisible}
          />

          {/* Canvas 2D ou Vue 3D avec utilisation complète de l'espace */}
          <div className="w-full h-full">
            {viewMode === "2d" ? (
              <FloorPlanCanvas
                canvasRef={canvasRef}
                elements={elements}
                selectedElement={selectedElement}
                currentTool={currentTool}
                zoom={zoom}
                offset={offset}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                ghostElement={ghostElement}
                unitSystem={unitSystem}
                showDimensions={showDimensions}
                moveMode={moveMode}
                handleCanvasClick={handleCanvasClick}
                handleElementDragStart={handleElementDragStart}
                handleCanvasDragStart={handleCanvasDragStart}
                handleMouseMove={handleMouseMove}
                handleMouseUp={handleMouseUp}
                startResize={startResize}
                startRotate={startRotate}
              />
            ) : (
              <FloorPlan3DViewer ref={threeViewerRef} elements={elements} calculatePlanCenter={calculatePlanCenter} />
            )}
          </div>
        </div>
      </div>

      {/* Dialog de sauvegarde */}
      <SavePlanDialog
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        planName={planName}
        setPlanName={setPlanName}
        handleSaveFloorPlan={handleSaveFloorPlan}
      />
    </div>
  )
}

