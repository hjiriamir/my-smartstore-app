"use client"
import { useRef } from "react"

export const PlanogramDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const groupRef = useRef()
  const rotationY = (furniture.rotation * Math.PI) / 180
  const { width, height, depth, sections, slots } = furniture
  const shelfSpacing = height / sections

  // Colors for the planogram
  const baseColor = "#f5f5f5" // Couleur plus claire pour correspondre à l'image
  const structureColor = "#e0e0e0" // Couleur plus claire pour la structure
  const shelfColor = "#f0f0f0" // Couleur plus claire pour les étagères
  const edgeColor = "#ffffff" // Couleur pour les bords des étagères

  return (
    <group ref={groupRef} position={[furniture.x, furniture.y, furniture.z]} rotation={[0, rotationY, 0]}>
      {/* Base structure - socle */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Panneau central vertical avec perforations */}
      <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color={structureColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Perforations sur le panneau central (points noirs) */}
      {Array.from({ length: sections * 2 }).map((_, idx) => {
        const y = (idx * height) / (sections * 2) + 0.2
        return (
          <group key={`perforation-${idx}`}>
            <mesh position={[0.03, y, -depth / 4]} receiveShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} rotation={[0, Math.PI / 2, 0]} />
              <meshStandardMaterial color="#999999" roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0.03, y, depth / 4]} receiveShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} rotation={[0, Math.PI / 2, 0]} />
              <meshStandardMaterial color="#999999" roughness={0.5} metalness={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Étagères traversantes */}
      {Array.from({ length: sections }).map((_, rowIndex) => {
        const shelfY = (rowIndex + 1) * shelfSpacing
        const shelfWidth = width
        const shelfThickness = 0.03

        return (
          <group key={`shelf-group-${rowIndex}`}>
            {/* Étagère traversante principale */}
            <mesh position={[0, shelfY, 0]} receiveShadow castShadow>
              <boxGeometry args={[shelfWidth, shelfThickness, depth]} />
              <meshStandardMaterial color={shelfColor} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Bordure avant Face A */}
            <mesh position={[0, shelfY - 0.01, -depth / 2 + 0.02]} receiveShadow castShadow>
              <boxGeometry args={[shelfWidth, shelfThickness + 0.02, 0.04]} />
              <meshStandardMaterial color={edgeColor} roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Bordure avant Face B */}
            <mesh position={[0, shelfY - 0.01, depth / 2 - 0.02]} receiveShadow castShadow>
              <boxGeometry args={[shelfWidth, shelfThickness + 0.02, 0.04]} />
              <meshStandardMaterial color={edgeColor} roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Supports d'étagères (petits rectangles verticaux) */}
            {Array.from({ length: 5 }).map((_, supportIndex) => {
              const supportX = (supportIndex - 2) * (shelfWidth / 4)

              return (
                <group key={`support-group-${rowIndex}-${supportIndex}`}>
                  {/* Support sous l'étagère */}
                  <mesh position={[supportX, shelfY - 0.03, 0]} receiveShadow castShadow>
                    <boxGeometry args={[0.05, 0.06, depth - 0.1]} />
                    <meshStandardMaterial color={structureColor} roughness={0.5} metalness={0.1} />
                  </mesh>
                </group>
              )
            })}
          </group>
        )
      })}

      {/* Les produits ne sont plus affichés */}
    </group>
  )
}
