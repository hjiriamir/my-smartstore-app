"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Text } from "@react-three/drei"
import * as THREE from "three"

export function CashierDisplay({ furniture, displayItems, products, onRemove }) {
  const groupRef = useRef()
  const { width = 1.2, height = 1.0, depth = 0.8 } = furniture

  // Couleurs pour la caisse
  const baseColor = "#4A4A4A"
  const topColor = "#303030"
  const screenColor = "#1E1E1E"
  const keyboardColor = "#2A2A2A"
  const drawerColor = "#3A3A3A"

  // Animation simple pour l'écran (effet d'allumage)
  useFrame((state) => {
    if (groupRef.current) {
      const screenMesh = groupRef.current.children.find((child) => child.userData.isScreen)
      if (screenMesh) {
        const material = screenMesh.material
        // Faire varier légèrement la luminosité de l'écran
        const brightness = 0.1 + Math.abs(Math.sin(state.clock.getElapsedTime() * 0.5)) * 0.05
        material.emissive = new THREE.Color(brightness, brightness, brightness * 1.2)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Base de la caisse */}
      <Box args={[width, height * 0.9, depth]} position={[0, height * 0.45, 0]}>
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
      </Box>

      {/* Dessus de la caisse (légèrement plus large) */}
      <Box args={[width * 1.05, height * 0.05, depth * 1.05]} position={[0, height * 0.95, 0]}>
        <meshStandardMaterial color={topColor} roughness={0.5} metalness={0.3} />
      </Box>

      {/* Écran de la caisse */}
      <Box
        args={[width * 0.5, height * 0.4, depth * 0.1]}
        position={[0, height * 1.2, -depth * 0.3]}
        rotation={[Math.PI * 0.15, 0, 0]}
        userData={{ isScreen: true }}
      >
        <meshStandardMaterial color={screenColor} roughness={0.2} metalness={0.8} emissive="#111111" />
      </Box>

      {/* Clavier */}
      <Box args={[width * 0.6, height * 0.05, depth * 0.4]} position={[0, height * 0.98, depth * 0.2]}>
        <meshStandardMaterial color={keyboardColor} roughness={0.6} metalness={0.2} />
      </Box>

      {/* Tiroir-caisse */}
      <Box args={[width * 0.9, height * 0.15, depth * 0.8]} position={[0, height * 0.3, 0]}>
        <meshStandardMaterial color={drawerColor} roughness={0.5} metalness={0.3} />
      </Box>

      {/* Poignée du tiroir */}
      <Box args={[width * 0.5, height * 0.03, depth * 0.03]} position={[0, height * 0.3, depth * 0.4]}>
        <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.7} />
      </Box>

      {/* Texte "CAISSE" */}
      <Text
        position={[0, height * 0.7, depth * 0.41]}
        rotation={[0, 0, 0]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {furniture.name || "CAISSE"}
      </Text>
    </group>
  )
}
