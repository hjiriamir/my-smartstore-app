"use client"

import type React from "react"
import { useDrop, useDrag } from "react-dnd"
import { useTranslation } from "react-i18next"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ItemTypes, FurnitureTypes } from "@/lib/furniture"
import type { PlanogramCell as PlanogramCellType, PlanogramConfig } from "@/lib/planogram"
import type { Product, ProductInstance } from "@/lib/product-store"

interface PlanogramCellProps {
  cell: PlanogramCellType
  products: Product[]
  productInstances: ProductInstance[]
  onDrop: (cellId: string, productId: string, instanceId: string | null, isNewInstance: boolean) => void
  onRemove: (cellId: string) => void
  onUpdateQuantity: (cellId: string, quantity: number) => void
  cellWidth: number
  cellHeight: number
  planogramConfig: PlanogramConfig
}

export const PlanogramCell = ({
  cell,
  products,
  productInstances,
  onDrop,
  onRemove,
  onUpdateQuantity,
  cellWidth,
  cellHeight,
  planogramConfig,
}: PlanogramCellProps) => {
  const { t } = useTranslation()

  const filteredProductInstances = productInstances.filter((pi) => pi.furnitureType === planogramConfig.furnitureType)
  const productInstance = cell.instanceId
    ? filteredProductInstances.find((pi) => pi.instanceId === cell.instanceId)
    : null
  const product = productInstance ? products.find((p) => p.primary_id === productInstance.productId) : null

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.PRODUCT, ItemTypes.PLANOGRAM_ITEM],
    drop: (item: { id: string; type: string; instanceId?: string; isNewInstance?: boolean }) => {
      onDrop(cell.id, item.id, item.instanceId || null, !!item.isNewInstance)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PLANOGRAM_ITEM,
    item: {
      id: productInstance?.productId,
      type: ItemTypes.PLANOGRAM_ITEM,
      instanceId: cell.instanceId,
      isNewInstance: false,
    },
    canDrag: !!cell.instanceId,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Number.parseInt(e.target.value, 10) || 1
    onUpdateQuantity(cell.id, quantity)
  }

  const renderCompactProductGrid = () => {
    if (!product || !product.image) return null
    const quantity = cell.quantity || 1
    const maxPerRow = Math.ceil(Math.sqrt(quantity))
    const rows = Math.ceil(quantity / maxPerRow)

    return (
      <div
        className="absolute inset-1 grid"
        style={{
          gridTemplateColumns: `repeat(${maxPerRow}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "1px",
        }}
      >
        {Array.from({ length: quantity }).map((_, index) => (
          <div key={index} className="flex items-center justify-center overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="object-contain max-h-full max-w-full"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))}
      </div>
    )
  }

  const getSideLabel = (side: string | undefined, cellX: number) => {
    if (side) {
      if (side === "left") return t("productImport.leftSide")
      if (side === "front") return t("productImport.frontSide")
      if (side === "back") return t("productImport.backSide")
      if (side === "right") return t("productImport.rightSide")
      return t(side)
    }
    if (planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY) {
      const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1
      const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3

      const leftLimit = leftRightColumns
      const frontLimit = leftLimit + frontBackColumns
      const backLimit = frontLimit + frontBackColumns

      if (cellX < leftLimit) {
        return t("productImport.leftSide")
      } else if (cellX >= leftLimit && cellX < frontLimit) {
        return t("productImport.frontSide")
      } else if (cellX >= frontLimit && cellX < backLimit) {
        return t("productImport.backSide")
      } else {
        return t("productImport.rightSide")
      }
    }
    return ""
  }

  return (
    <div
      ref={drop}
      className={`
        relative border border-dashed flex items-center justify-center
        ${isOver ? "bg-primary/10 border-primary" : "border-gray-300"}
        ${product ? "border-solid" : ""}
        ${
          planogramConfig.furnitureType === FurnitureTypes.GONDOLA
            ? cell.x < planogramConfig.columns / 2
              ? "bg-blue-50/30"
              : "bg-red-50/30"
            : ""
        }
        ${
          planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? cell.x < planogramConfig.columns / 4
              ? "bg-blue-100/30 border-blue-300"
              : cell.x >= planogramConfig.columns / 4 && cell.x < planogramConfig.columns / 2
                ? "bg-gray-700/10"
                : cell.x >= planogramConfig.columns / 2 && cell.x < (planogramConfig.columns * 3) / 4
                  ? "bg-gray-700/20"
                  : "bg-gray-800/10"
            : ""
        }
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
          {planogramConfig.displayMode === "compact" ? (
            renderCompactProductGrid()
          ) : (
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
            </div>
          )}

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

          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center bg-white/80 text-xs p-1">
            <span className="mr-1">{t("productImport.qty")}:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={cell.quantity || 1}
              onChange={handleQuantityChange}
              className="w-10 h-5 text-center text-xs border rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {planogramConfig.furnitureType === FurnitureTypes.GONDOLA && !product && (
        <span className="text-[10px] text-muted-foreground opacity-50">
          {cell.x < planogramConfig.columns / 2 ? t("productImport.faceA") : t("productImport.faceB")}
        </span>
      )}

      {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && !product && (
        <span className="text-[10px] text-muted-foreground opacity-50">{getSideLabel(cell.side, cell.x)}</span>
      )}
    </div>
  )
}
