"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Package, Settings, CuboidIcon as Cube } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductItem } from "./ProductItem"
import { SettingsPanel } from "./SettingsPanel"
import { FurniturePanel } from "./FurniturePanel"
import type { Product } from "@/lib/product-store"
import type { PlanogramConfig } from "@/lib/planogram"

interface ProductSidebarProps {
  products: Product[]
  planogramConfig: PlanogramConfig
  setPlanogramConfig: (config: PlanogramConfig | ((prev: PlanogramConfig) => PlanogramConfig)) => void
  defaultQuantity: number
  setDefaultQuantity: (quantity: number) => void
  zoom: number
  setZoom: (zoom: number) => void
  productSizeScale: number
  setProductSizeScale: (scale: number) => void
  isRTL: boolean
}

export const ProductSidebar = ({
  products,
  planogramConfig,
  setPlanogramConfig,
  defaultQuantity,
  setDefaultQuantity,
  zoom,
  setZoom,
  productSizeScale,
  setProductSizeScale,
  isRTL,
}: ProductSidebarProps) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("products")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  const suppliers = [...new Set(products.map((product) => product.supplier))].filter(Boolean).sort()
  const categories = [...new Set(products.map((product) => product.category_id))].filter(Boolean).sort()

  const filteredProducts = products.filter((product) => {
    const primaryId = product.primary_id ? product.primary_id.toLowerCase() : ""
    const supplier = product.supplier ? product.supplier.toLowerCase() : ""

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      primaryId.includes(searchTerm.toLowerCase()) ||
      supplier.includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    const matchesSupplier = !selectedSupplier || product.supplier === selectedSupplier

    return matchesSearch && matchesCategory && matchesSupplier
  })

  return (
    <Card className="h-full">
      <CardContent className="p-2 lg:p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-2 lg:mb-4 w-full">
            <TabsTrigger value="products" className="text-xs lg:text-sm">
              <Package className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">{t("productImport.produits")}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs lg:text-sm">
              <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">{t("productImport.parametres")}</span>
            </TabsTrigger>
            <TabsTrigger value="furniture" className="text-xs lg:text-sm">
              <Cube className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">{t("productImport.meubles")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-2 lg:space-y-4">
            <div className="space-y-2">
              <Input
                placeholder={t("productImport.rechercheProduct")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <select
                  className="p-2 border rounded-md text-xs lg:text-sm"
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">{t("productImport.allCategories")}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  className="p-2 border rounded-md text-xs lg:text-sm"
                  value={selectedSupplier || ""}
                  onChange={(e) => setSelectedSupplier(e.target.value || null)}
                >
                  <option value="">{t("productImport.allSuppliers")}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs lg:text-sm text-muted-foreground">
              {filteredProducts.length} {t("productImport.produittrouve")}
            </div>

            <ScrollArea className="h-[300px] lg:h-[calc(100vh-400px)]">
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-1 lg:gap-2 p-1">
                {filteredProducts.map((product, index) => (
                  <ProductItem key={`${product.primary_id}-${index}`} product={product} />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-2 text-center py-4 lg:py-8 text-muted-foreground text-xs lg:text-sm">
                    {t("productImport.noProductsFound")}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="space-y-2 lg:space-y-4">
            <SettingsPanel
              planogramConfig={planogramConfig}
              setPlanogramConfig={setPlanogramConfig}
              defaultQuantity={defaultQuantity}
              setDefaultQuantity={setDefaultQuantity}
              zoom={zoom}
              setZoom={setZoom}
              productSizeScale={productSizeScale}
              setProductSizeScale={setProductSizeScale}
              isRTL={isRTL}
            />
          </TabsContent>

          <TabsContent value="furniture" className="space-y-2 lg:space-y-4">
            <FurniturePanel planogramConfig={planogramConfig} setPlanogramConfig={setPlanogramConfig} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
