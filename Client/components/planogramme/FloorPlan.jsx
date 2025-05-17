import Walls from "./Walls"
import Doors from "./Doors"
import Planograms from "./Planograms"

const FloorPlan = ({ elements }) => {
  return (
    <group>
      <Walls walls={elements.walls} />
      <Doors doors={elements.doors} />
      <Planograms planograms={elements.planograms} />
    </group>
  )
}

export default FloorPlan

