const ViewControls = ({ viewMode, setViewMode }) => {
    return (
      <div className="view-controls">
        <button className={`view-button ${viewMode === "2d" ? "active" : ""}`} onClick={() => setViewMode("2d")}>
          2D View
        </button>
  
        <button className={`view-button ${viewMode === "3d" ? "active" : ""}`} onClick={() => setViewMode("3d")}>
          3D View
        </button>
      </div>
    )
  }
  
  export default ViewControls
  
  