// This is the updated part of the PlanogramScene component that handles product positioning
// Replace the corresponding section in your PlanogramScene component

// Inside the PlanogramScene component, replace the cells.filter(...).map(...) section with this:

import { Product3D } from "./Product3D" // Assuming Product3D is in a separate file
import { standardProductWidth, standardProductHeight, standardProductDepth } from "./product-constants" // Assuming these are defined in a separate file

{
  cells
    .filter((cell) => cell.furnitureType === planogramConfig.furnitureType && cell.instanceId !== null)
    .map((cell, cellIndex) => {
      const productInstance = filteredProductInstances.find((pi) => pi.instanceId === cell.instanceId)
      if (!productInstance) return null

      const product = products.find((p) => p.primary_Id === productInstance.productId)
      if (!product) return null

      // Calculate position based on furniture type
      const x = -width / 2 + cellWidth / 2 + cell.x * cellWidth

      // Improved Y position calculation
      // Calculate the shelf Y position
      const shelfY = (cell.y + 1) * shelfSpacing

      // Position the product so its bottom aligns with the shelf surface
      // We'll adjust the vertical position in the Product3D component
      const y = shelfY

      let z = -depth / 2 + standardProductDepth / 2 // Positionner près du bord avant

      // For gondola, adjust z position based on which side
      if (planogramConfig.furnitureType === FurnitureTypes.GONDOLA) {
        const midColumn = planogramConfig.columns / 2
        if (cell.x < midColumn) {
          z = -depth / 4 // Face A (avant)
        } else {
          z = depth / 4 // Face B (arrière)
        }
      }

      // Utiliser la quantité spécifiée ou 1 par défaut
      const quantity = cell.quantity || 1

      return (
        <Product3D
          key={cell.instanceId}
          position={[x, y, z]}
          size={[standardProductWidth, standardProductHeight, standardProductDepth]}
          product={product}
          quantity={quantity}
          displayMode={planogramConfig.displayMode}
          cellIndex={cellIndex} // Passer l'index de la cellule pour générer des clés uniques
        />
      )
    })
}
