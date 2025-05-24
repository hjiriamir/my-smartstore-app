"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next" // Ajoutez cette importation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Folder,
  Tag,
  Package,
  Edit,
  Trash2,
  ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import type { Product, Category } from "@/lib/product-store"

export function ProductLibrary() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const router = useRouter()
  const { toast } = useToast()
  const { products, categories, deleteProduct, setActiveTab, clearLibrary } = useProductStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  // Get unique suppliers
  const suppliers = [...new Set(products.map((product) => product.supplier))].filter(Boolean).sort()

  // Filter les produits
  const filteredProducts = products.filter((product) => {
    // Search term filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.primary_Id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  
    // Category filter
    const matchesCategory =
      !selectedCategory || selectedCategory === "all" ||
      product.category1_id === selectedCategory ||
      product.category2_id === selectedCategory ||
      product.category3_id === selectedCategory
  
    // Supplier filter - modification ici
    const matchesSupplier = 
      !selectedSupplier || 
      selectedSupplier === "all" || 
      product.supplier === selectedSupplier
  
    return matchesSearch && matchesCategory && matchesSupplier
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valueA = a[sortField]
    let valueB = b[sortField]

    // Handle string comparison
    if (typeof valueA === "string" && typeof valueB === "string") {
      valueA = valueA.toLowerCase()
      valueB = valueB.toLowerCase()
    }

    // Handle undefined values
    if (valueA === undefined) return sortDirection === "asc" ? 1 : -1
    if (valueB === undefined) return sortDirection === "asc" ? -1 : 1

    // Compare values
    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedSupplier, sortField, sortDirection])

  // Get category by ID
  const getCategoryById = (id: string | undefined): Category | undefined => {
    if (!id) return undefined
    return categories.find((cat) => cat.id === id)
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Go to planogram editor with selected product
  const goToPlanogramEditor = (product: Product) => {
    // Set the product as selected in store
    // This would be implemented in the store
    router.push("/planogram-editor")
  }

  return (
    <div className={`container max-w-6xl mx-auto py-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container max-w-6xl mx-auto py-6 mt-6">
        
      </div>
  
      <div className="flex flex-col space-y-6">
        {/* Header avec disposition inversée pour RTL */}
        <div className="flex items-center justify-between flex-row-reverse">
          <h1 className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('productLibrary')}
          </h1>
          
          <div className={`flex space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/Editor"}
              className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('productImport.backToEditor')}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={products.length === 0}>
                  {t('productImport.clearLibrary')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={isRTL ? 'text-right' : 'text-left'}>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('productImport.areYouSure')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('productImport.clearLibraryWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      clearLibrary()
                      toast({
                        title: t('libraryCleared'),
                        description: t('allProductsDeleted'),
                      })
                    }}
                  >
                    {t('productImport.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
              onClick={() => {
                setActiveTab("import")
                router.push("/product-import")
              }}
            >
              {t('importProducts')}
            </Button>
          </div>
        </div>
  
        <div className="flex flex-col space-y-4">
          {/* Filters */}
          <div className={`flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 ${isRTL ? 'md:space-x-reverse' : ''}`}>
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t('productImport.searchProduct')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-9' : 'pl-9'}
              />
            </div>
  
            <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
                <SelectTrigger className={`w-[180px] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Folder className="h-4 w-4" />
                    <SelectValue placeholder={t('productImport.category')} />
                  </div>
                </SelectTrigger>
                <SelectContent className={isRTL ? 'text-right' : 'text-left'}>
                  <SelectItem value="all">{t('productImport.allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
  
              <Select value={selectedSupplier || ""} onValueChange={(value) => setSelectedSupplier(value || null)}>
                <SelectTrigger className={`w-[180px] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Tag className="h-4 w-4" />
                    <SelectValue placeholder={t('productImport.supplier')} />
                  </div>
                </SelectTrigger>
                <SelectContent className={isRTL ? 'text-right' : 'text-left'}>
                  <SelectItem value="all">{t('productImport.allSuppliers')}</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
  
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={`${isRTL ? 'rounded-l-none' : 'rounded-r-none'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={`${isRTL ? 'rounded-r-none' : 'rounded-l-none'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
  
          {/* Sort options */}
          <div className={`flex items-center space-x-2 text-sm ${isRTL ? 'space-x-reverse' : ''}`}>
            <span className="text-muted-foreground">{t('productImport.sortBy')}:</span>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleSortChange("name")}>
              {t('name')}
              {sortField === "name" && (
                <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => handleSortChange("primary_Id")}
            >
              {t('productImport.id')}
              {sortField === "primary_Id" && (
                <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleSortChange("supplier")}>
              {t('productImport.supplier')}
              {sortField === "supplier" && (
                <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </Button>
          </div>
  
          {/* Results count */}
          <div className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('productImport.productsFound', { count: filteredProducts.length })}
          </div>
  
          {/* Product grid/list */}
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"
            }
          >
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => {
                const category1 = getCategoryById(product.category1_id)
                const category2 = getCategoryById(product.category2_id)
                const category3 = getCategoryById(product.category3_id)
  
                return viewMode === "grid" ? (
                  <Card key={product.primary_Id} className="overflow-hidden">
  <div className="relative aspect-square bg-muted/30 flex items-center justify-center">
    {product.image ? (
      <img
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        className="object-contain w-full h-full p-4"
      />
    ) : (
      <Package className="h-16 w-16 text-muted-foreground/30" />
    )}
  </div>
  <CardContent className="p-4">
    <div className="space-y-2">
      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h3 className="font-medium truncate">{product.name}</h3>
        <div className={`flex space-x-1 ${isRTL ? 'space-x-reverse' : ''}`}>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => deleteProduct(product.primary_Id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{t('id')}: {product.primary_Id}</div>
      {product.supplier && (
        <div className="text-xs text-muted-foreground">{t('supplier')}: {product.supplier}</div>
      )}
<div className="flex flex-col items-start space-y-1 mt-1">
  {category1 && (
    <div className="flex items-center">
      <Badge
        variant="outline"
        className="text-xs"
        style={{ borderColor: category1.color, color: category1.color }}
      >
        {category1.name}
      </Badge>
    </div>
  )}
  {category2 && (
    <div className="flex items-center ml-3"> {/* Indentation */}
      <ChevronRight className="h-3 w-3 text-muted-foreground mr-1" />
      <Badge
        variant="outline"
        className="text-xs"
        style={{ borderColor: category2.color, color: category2.color }}
      >
        {category2.name}
      </Badge>
    </div>
  )}
  {category3 && (
    <div className="flex items-center ml-6"> {/* Plus d'indentation */}
      <ChevronRight className="h-3 w-3 text-muted-foreground mr-1" />
      <Badge
        variant="outline"
        className="text-xs"
        style={{ borderColor: category3.color, color: category3.color }}
      >
        {category3.name}
      </Badge>
    </div>
  )}
</div>
      <Button
        variant="secondary"
        size="sm"
        className="w-full mt-2"
        onClick={() => goToPlanogramEditor(product)}
      >
        {t('productImport.placeInPlanogram')}
      </Button>
    </div>
  </CardContent>
</Card>
                ) : (
                  <div key={product.primary_Id} className={`flex items-center border rounded-md p-3 hover:bg-muted/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
  <div className="h-12 w-12 bg-muted/30 rounded-md flex items-center justify-center mr-4">
    {product.image ? (
      <img
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        className="object-contain w-full h-full p-1"
      />
    ) : (
      <Package className="h-6 w-6 text-muted-foreground/30" />
    )}
  </div>
  <div className="flex-1 min-w-0">
    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
      <h3 className="font-medium truncate">{product.name}</h3>
      <div className={`text-xs text-muted-foreground ${isRTL ? 'mr-2 ml-0' : 'ml-2'}`}>
        ({t('id')}: {product.primary_Id})
      </div>
    </div>
    <div className="text-sm text-muted-foreground truncate">
      {product.supplier && `${t('supplier')}: ${product.supplier}`}
    </div>
    <div className={`flex items-center space-x-1 mt-1 ${isRTL ? 'space-x-reverse' : ''}`}>
      {category1 && (
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: category1.color, color: category1.color }}
        >
          {category1.name}
        </Badge>
      )}
      {category2 && (
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: category2.color, color: category2.color }}
        >
          {category2.name}
        </Badge>
      )}
      {category3 && (
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: category3.color, color: category3.color }}
        >
          {category3.name}
        </Badge>
      )}
    </div>
  </div>
  <div className={`flex space-x-2 ${isRTL ? 'mr-auto ml-4 space-x-reverse' : 'ml-4'}`}>
    <Button variant="secondary" size="sm" onClick={() => goToPlanogramEditor(product)}>
      {t('place')}
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Edit className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive"
      onClick={() => deleteProduct(product.primary_Id)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>
                )
              })
            ) : (
              <div className={`col-span-full text-center py-12 text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('productImport.noProductsFound')}
              </div>
            )}
          </div>
  
          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="text-sm text-muted-foreground">
                {t('productImport.showingProducts', {
                  start: (currentPage - 1) * itemsPerPage + 1,
                  end: Math.min(currentPage * itemsPerPage, filteredProducts.length),
                  total: filteredProducts.length
                })}
              </div>
              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  {t('productImport.pageXofY', { current: currentPage, total: totalPages })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={t('perPage')} />
                  </SelectTrigger>
                  <SelectContent className={isRTL ? 'text-right' : 'text-left'}>
                    <SelectItem value="12">{t('productImport.itemsPerPage', { count: 12 })}</SelectItem>
                    <SelectItem value="24">{t('productImport.itemsPerPage', { count: 24 })}</SelectItem>
                    <SelectItem value="48">{t('productImport.itemsPerPage', { count: 48 })}</SelectItem>
                    <SelectItem value="96">{t('productImport.itemsPerPage', { count: 96 })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}