import React, { useState } from "react";
import "./Planogram.css";

const FloorPlan2D = () => {
  const [elements, setElements] = useState([]);

  const addElement = (type) => {
    setElements([...elements, { type, x: 100, y: 100 }]);
  };

  return (
    <div className="floorplan-2d">
      <button onClick={() => addElement("wall")}>Ajouter Mur</button>
      <button onClick={() => addElement("door")}>Ajouter Porte</button>
      <button onClick={() => addElement("planogram")}>Ajouter Planogramme</button>

      <div className="canvas-2d">
        {elements.map((el, index) => (
          <div
            key={index}
            className={`element ${el.type}`}
            style={{ left: el.x, top: el.y }}
          >
            {el.type}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorPlan2D;
