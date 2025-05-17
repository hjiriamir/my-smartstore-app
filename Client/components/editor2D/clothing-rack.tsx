"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import * as THREE from "three"
import {
  Plus,
  Minus,
  Save,
  Trash2,
  Package,
  Download,
  CuboidIcon as Cube,
  Grid,
  ImageIcon,
  FileText,
  Settings,
  Sliders,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import type { Product } from "@/lib/product-store"

// Types
interface ClothingRackConfig {
  name: string
  sections: number
  rackLength: number
  rackHeight: number
  spacing: number
  rackColor: string
  backgroundColor: string
  showLabels: boolean
}

interface ClothingItem {
  id: string
  productId: string
  position: number
  section: number
}

// Drag item types
const ItemTypes = {
  PRODUCT: "product",
  CLOTHING_ITEM: "clothing_item",
}

// Clothing Item Component (for the rack)
const ClothingItemComponent = ({
  item,
  product,
  onRemove,
  width,
  height,
}: {
  item: ClothingItem
  product: Product
  onRemove: (id: string) => void
  width: number
  height: number
}) => {
  // Créez une ref pour l'élément DOM
  const divRef = useRef<HTMLDivElement>(null);
  
  // Utilisez la ref dans useDrag
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CLOTHING_ITEM,
    item: { id: item.id, productId: product.primary_Id, type: ItemTypes.CLOTHING_ITEM },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Combinez les refs
  drag(divRef);

  // Determine if the product is a top, bottom, or accessory based on name or category
  const getItemType = useCallback(() => {
    const name = product.name.toLowerCase()
    if (name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")) {
      return "bottom"
    } else if (name.includes("cravate") || name.includes("écharpe") || name.includes("ceinture")) {
      return "accessory"
    } else {
      return "top" // Default to top (shirts, t-shirts, etc.)
    }
  }, [product.name])

  const itemType = getItemType()

  // Render different styles based on item type
  const renderItem = () => {
    if (itemType === "bottom") {
      return (
        <div className="flex flex-col items-center" style={{ width: `${width}px`, height: `${height}px` }}>
          {product.image ? (
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="object-contain w-full h-full"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                backgroundColor: product.color || "#6366f1",
                clipPath: "polygon(25% 0%, 75% 0%, 100% 5%, 100% 100%, 0% 100%, 0% 5%)",
              }}
            >
              <span className="text-xs text-white text-center px-1 rotate-90">{product.name}</span>
            </div>
          )}
          <div className="absolute top-0 right-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-white rounded-full shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      )
    } else if (itemType === "accessory") {
      return (
        <div className="flex flex-col items-center" style={{ width: `${width}px`, height: `${height}px` }}>
          {product.image ? (
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="object-contain w-full h-full"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <div
              className="w-3/4 h-full flex items-center justify-center"
              style={{
                backgroundColor: product.color || "#6366f1",
              }}
            >
              <span className="text-xs text-white text-center px-1 rotate-90">{product.name}</span>
            </div>
          )}
          <div className="absolute top-0 right-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-white rounded-full shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      )
    } else {
      // Top (default)
      return (
        <div className="flex flex-col items-center" style={{ width: `${width}px`, height: `${height}px` }}>
          {product.image ? (
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="object-contain w-full h-full"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                backgroundColor: product.color || "#6366f1",
                clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 80% 25%, 80% 100%, 20% 100%, 20% 25%, 0% 20%)",
              }}
            >
              <span className="text-xs text-white text-center px-1">{product.name}</span>
            </div>
          )}
          <div className="absolute top-0 right-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-white rounded-full shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <div
      ref={divRef}
      className={`
        absolute flex items-center justify-center
        ${isDragging ? "opacity-50" : ""}
        cursor-move
      `}
      style={{
        left: `${item.position * width}px`,
        top: "0px",
        width: `${width}px`,
        height: `${height}px`,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.6 : 1,
        boxShadow: isDragging ? "0 0 10px rgba(0, 0, 0, 0.2)" : "none",
      }}
    >
      {renderItem()}
    </div>
  )
}

// Rack Section Component (droppable)
const RackSection = ({
  section,
  clothingItems,
  products,
  onDrop,
  onRemove,
  config,
  itemWidth,
  setClothingItems,
}: {
  section: number
  clothingItems: ClothingItem[]
  products: Product[]
  onDrop: (section: number, position: number, productId: string) => void
  onRemove: (id: string) => void
  config: ClothingRackConfig
  itemWidth: number
  setClothingItems: (items: ClothingItem[]) => void
}) => {
  const sectionItems = clothingItems.filter((item) => item.section === section)
  const positions = Array.from({ length: Math.floor(config.rackLength / itemWidth) }, (_, i) => i)

  // Calculate the section width
  const sectionWidth = config.rackLength
  const sectionHeight = config.rackHeight

  // Simple drop position component
  const DropPosition = ({ position, section }: { position: number; section: number }) => {
    // Check if this position is occupied
    const isOccupied = sectionItems.some((item) => item.position === position)

    const [{ isOver, canDrop }, drop] = useDrop({
      accept: [ItemTypes.PRODUCT, ItemTypes.CLOTHING_ITEM],
      drop: (item: any) => {
        console.log("Dropping at position:", position, "Section:", section, "Item:", item)

        if (item.type === ItemTypes.PRODUCT) {
          onDrop(section, position, item.id)
        } else if (item.type === ItemTypes.CLOTHING_ITEM) {
          // Move existing item
          const updatedItems = clothingItems.map((ci) => (ci.id === item.id ? { ...ci, position, section } : ci))
          setClothingItems(updatedItems)
        }
      },
      canDrop: (item: any) => {
        if (isOccupied) {
          // Allow dropping if it's the same item being moved
          if (item.type === ItemTypes.CLOTHING_ITEM) {
            const existingItem = sectionItems.find((si) => si.position === position)
            return existingItem?.id === item.id
          }
          return false
        }
        return true
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    })

    return (
      <div
        ref={drop}
        className={`
          h-full border-dashed border-l border-r first:border-l-0 last:border-r-0
          ${isOver && canDrop ? "bg-green-100 border-green-300" : ""}
          ${!isOccupied ? "hover:bg-muted/50" : ""}
          transition-colors
        `}
        style={{
          width: `${itemWidth}px`,
          backgroundColor: isOccupied && !isOver ? "rgba(0,0,0,0.03)" : undefined,
        }}
        title={isOccupied ? "Position occupée" : "Déposer un vêtement ici"}
      ></div>
    )
  }

  return (
    <div
      className="relative border rounded-md bg-white"
      style={{
        width: `${sectionWidth}px`,
        height: `${sectionHeight}px`,
        marginBottom: `${config.spacing}px`,
      }}
    >
      {/* Rack bar */}
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{
          borderRadius: "4px 4px 0 0",
          backgroundColor: config.rackColor || "#CD7F32",
        }}
      ></div>

      {/* Section label */}
      {config.showLabels && (
        <div className="absolute -top-6 left-0 text-sm font-medium">
          Section {section + 1}/{config.sections}
        </div>
      )}

      {/* Position drop zones */}
      <div className="absolute top-2 left-0 right-0 bottom-0 flex">
        {positions.map((position) => (
          <DropPosition key={`pos-${section}-${position}`} position={position} section={section} />
        ))}
      </div>

      {/* Render clothing items */}
      {sectionItems.map((item) => {
        const product = products.find((p) => p.primary_Id === item.productId)
        if (!product) return null

        return (
          <ClothingItemComponent
            key={item.id}
            item={item}
            product={product}
            onRemove={onRemove}
            width={itemWidth}
            height={sectionHeight - 2} // Subtract rack bar height
          />
        )
      })}
    </div>
  )
}

// 3D Clothing Item Component
const ClothingItem3D = ({ item, product, position, sectionY, itemWidth, rackWidth }) => {
  // Determine item type
  const getItemType = () => {
    const name = product.name.toLowerCase()
    if (name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")) {
      return "bottom"
    } else if (name.includes("cravate") || name.includes("écharpe") || name.includes("ceinture")) {
      return "accessory"
    } else {
      return "top" // Default to top (shirts, t-shirts, etc.)
    }
  }

  const itemType = getItemType()

  // Calculate position
  const itemX = item.position * itemWidth - rackWidth / 2 + itemWidth / 2

  // Load texture if product has image
  const [texture, setTexture] = useState(null)
  const [textureLoaded, setTextureLoaded] = useState(false)
  const [textureError, setTextureError] = useState(false)

  useEffect(() => {
    if (product.image) {
      const loader = new THREE.TextureLoader()
      loader.crossOrigin = "anonymous"

      loader.load(
        product.image,
        (loadedTexture) => {
          loadedTexture.flipY = true
          setTexture(loadedTexture)
          setTextureLoaded(true)
        },
        undefined,
        (error) => {
          console.error("Error loading texture:", error)
          setTextureError(true)
        },
      )
    }
  }, [product.image])

  // Render based on item type
  if (itemType === "bottom") {
    return (
      <group position={[itemX, -0.5, 0]}>
        {textureLoaded && texture ? (
          <mesh>
            <planeGeometry args={[itemWidth * 0.8, 1]} />
            <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <>
            <mesh>
              <boxGeometry args={[itemWidth * 0.6, 1, 0.05]} />
              <meshStandardMaterial color={product.color || "#6366f1"} />
            </mesh>
            <Text
              position={[0, 0, 0.06]}
              rotation={[0, 0, Math.PI / 2]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.8}
            >
              {product.name}
            </Text>
          </>
        )}
      </group>
    )
  } else if (itemType === "accessory") {
    return (
      <group position={[itemX, -0.3, 0]}>
        {textureLoaded && texture ? (
          <mesh>
            <planeGeometry args={[itemWidth * 0.3, 0.6]} />
            <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <>
            <mesh>
              <boxGeometry args={[itemWidth * 0.2, 0.6, 0.02]} />
              <meshStandardMaterial color={product.color || "#6366f1"} />
            </mesh>
            <Text
              position={[0, 0, 0.03]}
              rotation={[0, 0, Math.PI / 2]}
              fontSize={0.06}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.5}
            >
              {product.name}
            </Text>
          </>
        )}
      </group>
    )
  } else {
    // Top (default)
    return (
      <group position={[itemX, -0.4, 0]}>
        {textureLoaded && texture ? (
          <mesh>
            <planeGeometry args={[itemWidth * 0.8, 0.8]} />
            <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <>
            <mesh>
              <boxGeometry args={[itemWidth * 0.7, 0.8, 0.05]} />
              <meshStandardMaterial color={product.color || "#6366f1"} />
            </mesh>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.6}
            >
              {product.name}
            </Text>
          </>
        )}
      </group>
    )
  }
}

// 3D Clothing Rack Component
const ClothingRack3D = ({ config, clothingItems, products }) => {
  const { scene } = useThree()

  // Set background color
  useEffect(() => {
    scene.background = new THREE.Color(config.backgroundColor || "#f5f5f5")
  }, [scene, config.backgroundColor])

  // Calculate dimensions
  const rackWidth = config.rackLength / 100 // Convert to meters
  const rackHeight = 0.05 // Thickness of the rack bar
  const rackDepth = 0.05
  const sectionSpacing = config.spacing / 100 // Convert to meters

  // Group clothing items by section
  const itemsBySection = {}
  clothingItems.forEach((item) => {
    if (!itemsBySection[item.section]) {
      itemsBySection[item.section] = []
    }
    itemsBySection[item.section].push(item)
  })

  // Calculate item width
  const itemWidth = rackWidth / Math.floor(config.rackLength / 40) // 40px in 3D space

  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />

      {/* Render each section */}
      {Array.from({ length: config.sections }).map((_, sectionIndex) => {
        const sectionY = sectionIndex * (config.rackHeight / 100 + sectionSpacing)

        return (
          <group key={`section-${sectionIndex}`} position={[0, -sectionY, 0]}>
            {/* Rack bar */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[rackWidth, rackHeight, rackDepth]} />
              <meshStandardMaterial color={config.rackColor || "#CD7F32"} />
            </mesh>

            {/* Section label */}
            {config.showLabels && (
              <Text
                position={[-rackWidth / 2 - 0.2, 0, 0]}
                fontSize={0.1}
                color="black"
                anchorX="right"
                anchorY="middle"
              >
                {`Section ${sectionIndex + 1}`}
              </Text>
            )}

            {/* Clothing items */}
            {itemsBySection[sectionIndex]?.map((item) => {
              const product = products.find((p) => p.primary_Id === item.productId)
              if (!product) return null

              return (
                <ClothingItem3D
                  key={item.id}
                  item={item}
                  product={product}
                  position={item.position}
                  sectionY={sectionY}
                  itemWidth={itemWidth}
                  rackWidth={rackWidth}
                />
              )
            })}
          </group>
        )
      })}

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  )
}

// Product Item Component (draggable from product list)
const ProductItem = ({ product }: { product: Product }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: { id: product.primary_Id, type: ItemTypes.PRODUCT },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

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
      <div className="mt-2 text-center">
        <div className="text-xs font-medium truncate w-20">{product.name}</div>
        <div className="text-[10px] text-muted-foreground truncate w-20">{product.primary_Id}</div>
      </div>
    </div>
  )
}

// Settings Dialog Component
const SettingsDialog = ({ config, updateConfig }) => {
  const [localConfig, setLocalConfig] = useState<ClothingRackConfig>({ ...config })

  const handleChange = (key: keyof ClothingRackConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateConfig(localConfig)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Paramètres du portant</DialogTitle>
          <DialogDescription>Configurez les paramètres avancés de votre portant à vêtements.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Nom du portant</label>
              <Input value={localConfig.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de sections</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange("sections", Math.max(1, localConfig.sections - 1))}
                  disabled={localConfig.sections <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={localConfig.sections}
                  onChange={(e) => handleChange("sections", Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange("sections", localConfig.sections + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Longueur du portant (px)</label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[localConfig.rackLength]}
                  min={300}
                  max={1000}
                  step={50}
                  onValueChange={(value) => handleChange("rackLength", value[0])}
                />
                <span className="text-sm w-12">{localConfig.rackLength}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hauteur du portant (px)</label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[localConfig.rackHeight]}
                  min={100}
                  max={300}
                  step={10}
                  onValueChange={(value) => handleChange("rackHeight", value[0])}
                />
                <span className="text-sm w-12">{localConfig.rackHeight}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Espacement entre sections (px)</label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[localConfig.spacing]}
                  min={10}
                  max={50}
                  step={5}
                  onValueChange={(value) => handleChange("spacing", value[0])}
                />
                <span className="text-sm w-12">{localConfig.spacing}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur du portant</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localConfig.rackColor || "#CD7F32"}
                  onChange={(e) => handleChange("rackColor", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={localConfig.rackColor || "#CD7F32"}
                  onChange={(e) => handleChange("rackColor", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur d'arrière-plan (3D)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localConfig.backgroundColor || "#f5f5f5"}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={localConfig.backgroundColor || "#f5f5f5"}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showLabels"
                checked={localConfig.showLabels}
                onChange={(e) => handleChange("showLabels", e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showLabels" className="text-sm font-medium">
                Afficher les étiquettes des sections
              </label>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSave}>Appliquer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Clothing Rack Editor Component
export function ClothingRackEditor() {
  const { toast } = useToast()
  const { products } = useProductStore()
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D")
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const rack2DRef = useRef<HTMLDivElement>(null)

  // Rack configuration with extended properties
  const [rackConfig, setRackConfig] = useState<ClothingRackConfig>({
    name: "Portant à vêtements",
    sections: 2,
    rackLength: 600,
    rackHeight: 200,
    spacing: 20,
    rackColor: "#CD7F32",
    backgroundColor: "#f5f5f5",
    showLabels: true,
  })

  // Get unique suppliers
  const suppliers = [...new Set(products.map((product) => product.supplier))].filter(Boolean).sort()

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search term filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.primary_Id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()))

    // Category filter
    const matchesCategory =
      !selectedCategory ||
      product.category1_id === selectedCategory ||
      product.category2_id === selectedCategory ||
      product.category3_id === selectedCategory

    // Supplier filter
    const matchesSupplier = !selectedSupplier || product.supplier === selectedSupplier

    return matchesSearch && matchesCategory && matchesSupplier
  })

  // Generate a unique ID for clothing items
  const generateItemId = useCallback(() => {
    return `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }, [])

  // Handle adding a product to the rack
  const handleAddToRack = useCallback(
    (section: number, position: number, productId: string) => {
      setClothingItems((prev) => {
        const newItem: ClothingItem = {
          id: generateItemId(),
          productId,
          position,
          section,
        }
        return [...prev, newItem]
      })

      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté au portant.",
      })
    },
    [generateItemId, toast],
  )

  // Debug function to log drag and drop events
  useEffect(() => {
    console.log("Current clothing items:", clothingItems)
  }, [clothingItems])

  // Handle removing a product from the rack
  const handleRemoveFromRack = useCallback(
    (itemId: string) => {
      setClothingItems((prev) => prev.filter((item) => item.id !== itemId))

      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré du portant.",
      })
    },
    [toast],
  )

  // Update clothing items state
  const updateClothingItems = useCallback((items) => {
    setClothingItems(items)
  }, [])

  // Update rack configuration
  const updateRackConfig = useCallback((newConfig: Partial<ClothingRackConfig>) => {
    setRackConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  // Save rack configuration
  const saveRack = () => {
    // Here you would save the rack to your backend or local storage
    toast({
      title: "Portant sauvegardé",
      description: `Le portant "${rackConfig.name}" a été sauvegardé avec succès.`,
    })
  }

  // Calculate item width based on rack length
  const itemWidth = 40 // Fixed width for clothing items

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto py-6 max-w-full">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Éditeur de Portant à Vêtements</h1>
            <div className="flex items-center space-x-2">
              <div className="flex border rounded-md mr-2">
                <Button
                  variant={viewMode === "2D" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("2D")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  2D
                </Button>
                <Button
                  variant={viewMode === "3D" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("3D")}
                  className="rounded-l-none"
                >
                  <Cube className="h-4 w-4 mr-2" />
                  3D
                </Button>
              </div>

              <SettingsDialog config={rackConfig} updateConfig={updateRackConfig} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {}} disabled={isExporting}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Exporter en image ({viewMode})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}} disabled={isExporting}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter en PDF ({viewMode})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={saveRack}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-[calc(100vh-120px)]">
                <ScrollArea className="h-full">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Configuration du portant</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nom du portant</label>
                          <Input
                            value={rackConfig.name}
                            onChange={(e) => updateRackConfig({ name: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Nombre de sections</label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateRackConfig({ sections: Math.max(1, rackConfig.sections - 1) })}
                              disabled={rackConfig.sections <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={rackConfig.sections}
                              onChange={(e) =>
                                updateRackConfig({ sections: Math.max(1, Number.parseInt(e.target.value) || 1) })
                              }
                              className="text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateRackConfig({ sections: rackConfig.sections + 1 })}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Longueur du portant (px)</label>
                          <div className="flex items-center space-x-2">
                            <Slider
                              value={[rackConfig.rackLength]}
                              min={300}
                              max={1000}
                              step={50}
                              onValueChange={(value) => updateRackConfig({ rackLength: value[0] })}
                            />
                            <span className="text-sm w-12">{rackConfig.rackLength}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Hauteur du portant (px)</label>
                          <div className="flex items-center space-x-2">
                            <Slider
                              value={[rackConfig.rackHeight]}
                              min={100}
                              max={300}
                              step={10}
                              onValueChange={(value) => updateRackConfig({ rackHeight: value[0] })}
                            />
                            <span className="text-sm w-12">{rackConfig.rackHeight}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Espacement entre sections (px)</label>
                          <div className="flex items-center space-x-2">
                            <Slider
                              value={[rackConfig.spacing]}
                              min={10}
                              max={50}
                              step={5}
                              onValueChange={(value) => updateRackConfig({ spacing: value[0] })}
                            />
                            <span className="text-sm w-12">{rackConfig.spacing}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            document.querySelector('[aria-label="Paramètres du portant"]')?.click()
                          }}
                        >
                          <Sliders className="h-4 w-4 mr-2" />
                          Paramètres avancés
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Produits</h3>

                      <div className="space-y-2">
                        <Input
                          placeholder="Rechercher un produit..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <select
                            className="p-2 border rounded-md text-sm"
                            value={selectedCategory || ""}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                          >
                            <option value="">Toutes les catégories</option>
                            {/* Add categories here */}
                          </select>

                          <select
                            className="p-2 border rounded-md text-sm"
                            value={selectedSupplier || ""}
                            onChange={(e) => setSelectedSupplier(e.target.value || null)}
                          >
                            <option value="">Tous les fournisseurs</option>
                            {suppliers.map((supplier) => (
                              <option key={supplier} value={supplier}>
                                {supplier}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">{filteredProducts.length} produits trouvés</div>

                      <div className="h-[300px]">
                        <ScrollArea className="h-full">
                          <div className="grid grid-cols-2 gap-2 p-1">
                            {filteredProducts.map((product) => (
                              <ProductItem key={product.primary_Id} product={product} />
                            ))}
                            {filteredProducts.length === 0 && (
                              <div className="col-span-2 text-center py-8 text-muted-foreground">
                                Aucun produit ne correspond à votre recherche
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
            </div>

            {/* Main rack area */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">{rackConfig.name}</h2>
                    <div className="text-sm text-muted-foreground">{rackConfig.sections} sections</div>
                  </div>

                  {viewMode === "2D" ? (
                    <div className="overflow-auto border rounded-md p-4 bg-muted/20">
                      <div
                        ref={rack2DRef}
                        className="relative bg-white p-4"
                        style={{
                          width: `${rackConfig.rackLength + 40}px`, // Add padding
                          minHeight: `${rackConfig.sections * (rackConfig.rackHeight + rackConfig.spacing) + 40}px`, // Add padding
                        }}
                      >
                        {/* Section labels */}
                        {rackConfig.showLabels && (
                          <div className="flex justify-between mb-4">
                            <div className="text-sm font-medium">Fashion 1/{rackConfig.sections}</div>
                            {rackConfig.sections > 1 && (
                              <div className="text-sm font-medium">Fashion 2/{rackConfig.sections}</div>
                            )}
                          </div>
                        )}

                        {/* Render rack sections */}
                        {Array.from({ length: rackConfig.sections }).map((_, sectionIndex) => (
                          <RackSection
                            key={`section-${sectionIndex}`}
                            section={sectionIndex}
                            clothingItems={clothingItems}
                            products={products}
                            onDrop={handleAddToRack}
                            onRemove={handleRemoveFromRack}
                            config={rackConfig}
                            itemWidth={itemWidth}
                            setClothingItems={setClothingItems}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden" style={{ height: "600px" }}>
                      <Canvas shadows>
                        <ClothingRack3D config={rackConfig} clothingItems={clothingItems} products={products} />
                      </Canvas>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
