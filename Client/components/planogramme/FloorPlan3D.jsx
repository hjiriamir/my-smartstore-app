import React from "react";
import { useThree } from "@react-three/fiber";
import { Box, Plane } from "@react-three/drei";

const FloorPlan3D = () => {
  return (
    <>
      {/* Sol */}
      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial attach="material" color="lightgray" />
      </Plane>

      {/* Mur */}
      <Box args={[5, 3, 0.2]} position={[0, 1.5, -2.5]}>
        <meshStandardMaterial attach="material" color="brown" />
      </Box>

      {/* Porte */}
      <Box args={[1, 2, 0.1]} position={[2, 1, -2.5]}>
        <meshStandardMaterial attach="material" color="white" />
      </Box>

      {/* Planogramme */}
      <Box args={[2, 1, 0.2]} position={[-2, 0.5, -2.5]}>
        <meshStandardMaterial attach="material" color="blue" />
      </Box>
    </>
  );
};

export default FloorPlan3D;
