"use client"

import { useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sky, Grid, PerspectiveCamera } from "@react-three/drei"
import "./Planogram.css"
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

// Tool components
import Sidebar from "./components/Sidebar"
import FloorPlan from "./components/FloorPlan"
import ViewControls from "./components/ViewControls"

const Planogram = () => {
  // State for managing the floor plan elements
  const [elements, setElements] = useState({
    walls: [],
    doors: [],
    planograms: [],
  })

  // State for the currently selected tool
  const [activeTool, setActiveTool] = useState("select")

  // State for view mode (2D or 3D)
  const [viewMode, setViewMode] = useState("2d")

  // State for tracking if we're currently drawing
  const [isDrawing, setIsDrawing] = useState(false)

  // Reference to the canvas container for mouse position calculations
  const canvasContainerRef = useRef(null)

  // State for storing the start point when drawing walls
  const [startPoint, setStartPoint] = useState(null)

  // Function to handle adding a new wall
  const handleAddWall = (start, end) => {
    setElements((prev) => ({
      ...prev,
      walls: [...prev.walls, { id: `wall-${Date.now()}`, start, end }],
    }))
  }

  // Function to handle adding a new door
  const handleAddDoor = (position, rotation) => {
    setElements((prev) => ({
      ...prev,
      doors: [...prev.doors, { id: `door-${Date.now()}`, position, rotation }],
    }))
  }

  // Function to handle adding a new planogram
  const handleAddPlanogram = (position, size, type) => {
    setElements((prev) => ({
      ...prev,
      planograms: [
        ...prev.planograms,
        {
          id: `planogram-${Date.now()}`,
          position,
          size,
          type,
        },
      ],
    }))
  }

  // Function to handle mouse down event on the canvas
  const handleMouseDown = (e) => {
    if (activeTool === "select") return

    const canvasRect = canvasContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - canvasRect.left) / canvasRect.width) * 20 - 10
    const z = ((e.clientY - canvasRect.top) / canvasRect.height) * 20 - 10

    if (activeTool === "wall") {
      setIsDrawing(true)
      setStartPoint({ x, z })
    } else if (activeTool === "door") {
      handleAddDoor({ x, z, y: 0 }, 0)
    } else if (activeTool === "planogram") {
      handleAddPlanogram({ x, z, y: 0 }, { width: 2, height: 1.5, depth: 0.5 }, "shelf")
    }
  }

  // Function to handle mouse move event on the canvas
  const handleMouseMove = (e) => {
    if (!isDrawing || activeTool !== "wall") return

    // Implementation for real-time wall preview would go here
  }

  // Function to handle mouse up event on the canvas
  const handleMouseUp = (e) => {
    if (!isDrawing || activeTool !== "wall") return

    const canvasRect = canvasContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - canvasRect.left) / canvasRect.width) * 20 - 10
    const z = ((e.clientY - canvasRect.top) / canvasRect.height) * 20 - 10

    handleAddWall(startPoint, { x, z })
    setIsDrawing(false)
    setStartPoint(null)
  }

  return (
    <div className="planogram-container">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />

      <div className="main-content">
        <ViewControls viewMode={viewMode} setViewMode={setViewMode} />

        <div
          className="canvas-container"
          ref={canvasContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Canvas shadows>
            {/* Camera setup based on view mode */}
            {viewMode === "2d" ? (
              <PerspectiveCamera makeDefault position={[0, 15, 0]} rotation={[-Math.PI / 2, 0, 0]} fov={50} />
            ) : (
              <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
            )}

            {/* Environment */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

            {/* Grid for reference */}
            <Grid
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6f6f6f"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#9d4b4b"
              fadeDistance={30}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={true}
            />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Floor plan elements */}
            <FloorPlan elements={elements} />

            {/* Controls */}
            {viewMode === "3d" && (
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
              />
            )}

            {/* Sky for 3D view */}
            {viewMode === "3d" && <Sky />}
          </Canvas>
        </div>
      </div>
    </div>
  )
}

export default Planogram

