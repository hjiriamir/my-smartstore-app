"use client"

import { useDrag, useDrop } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Product } from "@/lib/product-store"
import { ItemTypes } from "@/components/types/furniture-types"

interface FurnitureCellProps {
  cell: { id: string; x: number; y: number; productId: string | null; quantity?: number }
  products: Product[]
  onDrop: (cellId: string, productId: string) => void
  onRemove: (cellId: string) => void
  cellWidth: number
  cellHeight: number
}

export function FurnitureCell({ cell, products, onDrop, onRemove, cellWidth, cellHeight }: FurnitureCellProps) {
  const product = cell.productId ? products.find((p) => p.primary_id === cell.productId) : null

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.PRODUCT, ItemTypes.FURNITURE_PRODUCT],
    drop: (item: { id: string; type: string }) => {
      onDrop(cell.id, item.id)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FURNITURE_PRODUCT,
    item: {
      id: cell.productId,
      type: ItemTypes.FURNITURE_PRODUCT,
    },
    canDrag: !!cell.productId,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`
        relative border border-dashed flex items-center justify-center
        ${isOver ? "bg-primary/10 border-primary" : "border-gray-300"}
        ${product ? "border-solid" : ""}
      `}
      style={{
        width: `${cellWidth}px`,
        height: `${cellHeight}px`,
        borderColor: product ? "#22c55e" : undefined,
      }}
    >
      {product && (
        <div
          ref={drag}
          className={`
            absolute inset-1 flex flex-col items-center justify-center bg-white rounded-sm
            ${isDragging ? "opacity-50" : ""}
            cursor-move
          `}
        >
          <div className="relative flex-1 w-full flex items-center justify-center p-1">
            {product.image ? (
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="object-contain max-h-full max-w-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-muted/20 rounded-sm"
                style={{ backgroundColor: product.color || "#f3f4f6" }}
              >
                <span className="text-xs text-center px-1">{product.name}</span>
              </div>
            )}
            {cell.quantity && cell.quantity > 1 && (
              <div className="absolute bottom-0 right-0 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cell.quantity}
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-white rounded-full shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(cell.id)
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
