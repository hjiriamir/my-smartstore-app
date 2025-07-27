import { Text } from "@react-three/drei"
import type { PlanogramConfig } from "@/types/planogram"

interface ShelvesDisplayProps {
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
  planogramConfig: PlanogramConfig
}

export const ShelvesDisplay = ({ position, dimensions, rows, columns, planogramConfig }: ShelvesDisplayProps) => {
  const { width, height, depth, baseHeight, shelfThickness } = dimensions

  const shelvesRows = planogramConfig?.shelvesConfig?.rows || rows
  const shelfSpacing = height / shelvesRows

  const baseColor = "#f5f5f5"
  const shelfColor = "#ffffff"
  const metalColor = "#e0e0e0"
  const structureColor = "#f0f0f0"
  const backPanelColor = "#f8f8f8"
  const leftSideColor = "#f0f0f0"
  const rightSideColor = "#e8e8e8"

  return (
    <group position={position}>
      {/* Base of the furniture */}
      <mesh position={[0, baseHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Main structure */}
      <group>
        {/* Central back panel */}
        <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color={backPanelColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Side panels */}
        <mesh position={[-width / 2 + 0.025, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={leftSideColor} roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[width / 2 - 0.025, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={rightSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Shelves */}
        {Array.from({ length: shelvesRows }).map((_, rowIndex) => {
          const shelfY = (rowIndex + 1) * shelfSpacing
          return (
            <group key={`shelf-group-${rowIndex}`}>
              {/* Front side shelf */}
              <mesh position={[0, shelfY, depth / 2 - 0.05]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Back side shelf */}
              <mesh position={[0, shelfY, -depth / 2 + 0.05]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Left side shelf */}
              <mesh position={[-width / 2 - 0.1, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 0.8]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Right side shelf */}
              <mesh position={[width / 2, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 1.2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Metal edges */}
              <mesh position={[0, shelfY + 0.02, depth / 2]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>
              <mesh position={[0, shelfY + 0.02, -depth / 2]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Text indicators */}
      <group position={[0, height * 0.8, 0]}>
        <Text position={[-width / 2 - 0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.2} color="black">
          GAUCHE
        </Text>

        <Text position={[0, 0, depth / 2 + 0.2]} fontSize={0.2} color="black">
          AVANT
        </Text>

        <Text position={[0, 0, -depth / 2 - 0.2]} rotation={[0, Math.PI, 0]} fontSize={0.2} color="black">
          ARRIÈRE
        </Text>

        <Text position={[width / 2 + 0.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.2} color="black">
          DROITE
        </Text>
      </group>

      {/* Lighting */}
      <group position={[0, height + 0.5, 0]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <group key={`light-${i}`} position={[((i - 1) * width) / 3, 0, 0]}>
            <pointLight position={[0, -0.5, 0]} intensity={0.3} distance={5} decay={2} />
          </group>
        ))}
      </group>
    </group>
  )
}
