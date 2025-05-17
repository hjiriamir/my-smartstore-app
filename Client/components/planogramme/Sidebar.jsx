import { Square, DoorOpenIcon as Door, LayoutGrid, MousePointer, Trash2, Save, FolderOpen } from "lucide-react"
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

const Sidebar = ({ activeTool, setActiveTool }) => {
  return (
    <div className="sidebar">
      <h2>Floor Planner</h2>

      <div className="tool-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          <button
            className={`tool-button ${activeTool === "select" ? "active" : ""}`}
            onClick={() => setActiveTool("select")}
          >
            <MousePointer className="tool-button-icon" size={18} />
            Select
          </button>

          <button
            className={`tool-button ${activeTool === "wall" ? "active" : ""}`}
            onClick={() => setActiveTool("wall")}
          >
            <Square className="tool-button-icon" size={18} />
            Wall
          </button>

          <button
            className={`tool-button ${activeTool === "door" ? "active" : ""}`}
            onClick={() => setActiveTool("door")}
          >
            <Door className="tool-button-icon" size={18} />
            Door
          </button>

          <button
            className={`tool-button ${activeTool === "planogram" ? "active" : ""}`}
            onClick={() => setActiveTool("planogram")}
          >
            <LayoutGrid className="tool-button-icon" size={18} />
            Planogram
          </button>
        </div>
      </div>

      <div className="tool-section">
        <h3>Actions</h3>
        <div className="tool-buttons">
          <button className="tool-button">
            <Save className="tool-button-icon" size={18} />
            Save
          </button>

          <button className="tool-button">
            <FolderOpen className="tool-button-icon" size={18} />
            Load
          </button>

          <button className="tool-button">
            <Trash2 className="tool-button-icon" size={18} />
            Clear All
          </button>
        </div>
      </div>

      <div className="tool-section">
        <h3>Planogram Types</h3>
        <div className="tool-buttons">
          <button className="tool-button">
            <LayoutGrid className="tool-button-icon" size={18} />
            Shelf
          </button>

          <button className="tool-button">
            <LayoutGrid className="tool-button-icon" size={18} />
            Display
          </button>

          <button className="tool-button">
            <LayoutGrid className="tool-button-icon" size={18} />
            Counter
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

