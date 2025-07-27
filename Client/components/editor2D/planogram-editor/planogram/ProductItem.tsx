"use client"

import { useDrag } from "react-dnd"
import { Package } from "lucide-react"
import { ItemTypes } from "@/lib/furniture"
import type { Product } from "@/lib/product-store"

interface ProductItemProps {
  product: Product
}

export const ProductItem = ({ product }: ProductItemProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: { id: product.primary_id, type: ItemTypes.PRODUCT, isNewInstance: true },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`
        flex flex-col items-center p-1 lg:p-2 border rounded-md cursor-move
        ${isDragging ? "opacity-50" : ""}
        hover:border-primary hover:bg-primary/5 transition-colors
      `}
    >
      <div className="relative w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="object-contain w-full h-full p-0.5 lg:p-1"
          />
        ) : (
          <Package className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground/30" />
        )}
      </div>
      <div className="mt-1 lg:mt-2 text-center">
        <div className="text-[10px] lg:text-xs font-medium truncate w-16 lg:w-20">{product.name}</div>
        <div className="text-[8px] lg:text-[10px] text-muted-foreground truncate w-16 lg:w-20">
          {product.primary_id}
        </div>
      </div>
    </div>
  )
}
