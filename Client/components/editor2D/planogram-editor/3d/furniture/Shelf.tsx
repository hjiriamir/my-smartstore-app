interface ShelfProps {
    position: [number, number, number]
    size: [number, number, number]
    color?: string
  }
  
  export const Shelf = ({ position, size, color = "#FFFFFF" }: ShelfProps) => {
    return (
      <mesh position={position} receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }
  