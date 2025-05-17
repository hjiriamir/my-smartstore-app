const Doors = ({ doors }) => {
    // Door dimensions
    const doorWidth = 0.9
    const doorHeight = 2.1
    const doorThickness = 0.05
  
    return (
      <group>
        {doors.map((door) => (
          <group
            key={door.id}
            position={[door.position.x, doorHeight / 2, door.position.z]}
            rotation={[0, door.rotation, 0]}
            className="door"
          >
            {/* Door frame */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
              <meshStandardMaterial color="#e67e22" />
            </mesh>
  
            {/* Door handle */}
            <mesh position={[doorWidth / 2 - 0.1, 0, doorThickness / 2]} castShadow>
              <sphereGeometry args={[0.03]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    )
  }
  
  export default Doors
  
  