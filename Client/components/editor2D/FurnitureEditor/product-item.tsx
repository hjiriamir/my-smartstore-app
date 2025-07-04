"use client"

import { useDrag } from "react-dnd"
import { useTranslation } from "react-i18next"
import { Package } from "lucide-react"
import type { Product } from "@/lib/product-store"
import { ItemTypes } from "@/components/types/furniture-types"

interface ProductItemProps {
  product: Product
}

export function ProductItem({ product }: ProductItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: { id: product.primary_id, type: ItemTypes.PRODUCT },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  return (
    <div
      ref={drag}
      className={`
        flex flex-col items-center p-2 border rounded-md cursor-move
        ${isDragging ? "opacity-50" : ""}
        hover:border-primary hover:bg-primary/5 transition-colors
      `}
    >
      <div className="relative w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="object-contain w-full h-full p-1"
          />
        ) : (
          <Package className="h-8 w-8 text-muted-foreground/30" />
        )}
      </div>
      <div className="mt-2 text-center" dir={textDirection}>
        <div className="text-xs font-medium truncate w-20">{product.name}</div>
        <div className="text-[10px] text-muted-foreground truncate w-20">{product.primary_id}</div>
      </div>
    </div>
  )
}
