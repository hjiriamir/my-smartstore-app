interface GondolaProps {
    position: [number, number, number]
    dimensions: {
      width: number
      height: number
      depth: number
      baseHeight: number
      shelfThickness: number
    }
    rows: number
    columns: number
  }
  
  export const Gondola = ({ position, dimensions, rows, columns }: GondolaProps) => {
    const { width, height, depth, baseHeight, shelfThickness } = dimensions
    const shelfSpacing = height / rows
  
    const baseColor = "#9e9e9e"
    const structureColor = "#757575"
    const shelfColor = "#bdbdbd"
    const metalColor = "#b0b0b0"
    const edgeColor = "#d0d0d0"
  
    return (
      <group position={position}>
        {/* Base of the gondola */}
        <mesh position={[0, baseHeight / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, baseHeight, depth]} />
          <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
        </mesh>
  
        {/* Back panel */}
        <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color={structureColor} roughness={0.6} metalness={0.3} />
        </mesh>
  
        {/* Vertical supports on sides */}
        <mesh position={[-width / 2 + 0.05, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.1, height, depth]} />
          <meshStandardMaterial color={structureColor} roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[width / 2 - 0.05, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.1, height, depth]} />
          <meshStandardMaterial color={structureColor} roughness={0.6} metalness={0.3} />
        </mesh>
  
        {/* Shelves for both sides */}
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const shelfY = (rowIndex + 1) * shelfSpacing
          const shelfWidth = width - 0.1
          return (
            <group key={`shelf-group-${rowIndex}`}>
              {/* Side A shelf */}
              <mesh position={[0, shelfY, -depth / 4]} rotation={[0.03, 0, 0]} receiveShadow castShadow>
                <boxGeometry args={[shelfWidth, shelfThickness, depth / 2 - 0.05]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.2} />
              </mesh>
  
              {/* Side A edge trim */}
              <mesh position={[0, shelfY + 0.02, -depth / 2 + 0.05]} receiveShadow castShadow>
                <boxGeometry args={[shelfWidth, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={edgeColor} metalness={0.4} roughness={0.3} />
              </mesh>
  
              {/* Side B shelf */}
              <mesh position={[0, shelfY, depth / 4]} rotation={[0.03, Math.PI, 0]} receiveShadow castShadow>
                <boxGeometry args={[shelfWidth, shelfThickness, depth / 2 - 0.05]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.2} />
              </mesh>
  
              {/* Side B edge trim */}
              <mesh position={[0, shelfY + 0.02, depth / 2 - 0.05]} receiveShadow castShadow>
                <boxGeometry args={[shelfWidth, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={edgeColor} metalness={0.4} roughness={0.3} />
              </mesh>
  
              {/* Price tag holders */}
              <mesh position={[0, shelfY + 0.04, -depth / 2 + 0.03]} receiveShadow>
                <boxGeometry args={[shelfWidth, 0.02, 0.01]} />
                <meshStandardMaterial color={metalColor} metalness={0.6} roughness={0.2} />
              </mesh>
              <mesh position={[0, shelfY + 0.04, depth / 2 - 0.03]} receiveShadow>
                <boxGeometry args={[shelfWidth, 0.02, 0.01]} />
                <meshStandardMaterial color={metalColor} metalness={0.6} roughness={0.2} />
              </mesh>
            </group>
          )
        })}
      </group>
    )
  }
  