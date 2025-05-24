"use client"

import { useState } from "react"
import { Folder, FolderPlus, Trash2, Edit, Save, X, ChevronRight, ChevronDown, ArrowLeft  } from "lucide-react"
import { MainNav } from "@/components/editor2D/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"

interface Category {
  id: string
  name: string
  color: string
  parentId: string | null
  children: Category[]
}

export function CategoryManager() {
  const { toast } = useToast()
  const { categories, addCategory, updateCategory, deleteCategory } = useProductStore()

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<{
    id: string // Ajouté pour l'ID personnalisé
    name: string
    color: string
    parentId: string | null
  }>({
    id: "", // ID laissé vide par défaut (sera généré automatiquement)
    name: "",
    color: "#6366f1",
    parentId: null,
  })
  const [editForm, setEditForm] = useState<{
    id: string
    name: string
    color: string
  }>({
    id: "",
    name: "",
    color: "",
  })

  // Build category tree (inchangé)
  const buildCategoryTree = (): Category[] => {
    const categoryMap = new Map<string, Category>()

    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
      })
    })

    const rootCategories: Category[] = []

    categoryMap.forEach((category) => {
      if (category.parentId === null) {
        rootCategories.push(category)
      } else {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(category)
        }
      }
    })

    return rootCategories
  }

  const categoryTree = buildCategoryTree()

  // Toggle category expansion (inchangé)
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Add new category (modifié)
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
        variant: "destructive",
      })
      return
    }

    // Vérifier si un ID personnalisé est fourni et qu'il est unique
    const customId = newCategory.id.trim()
    if (customId) {
      if (categories.some(cat => cat.id === customId)) {
        toast({
          title: "Erreur",
          description: "Cet ID est déjà utilisé par une autre catégorie",
          variant: "destructive",
        })
        return
      }
    }

    // Utiliser l'ID personnalisé ou générer un nouvel ID
    const id = customId || `cat-${Date.now()}`

    addCategory({
      id,
      name: newCategory.name.trim(),
      color: newCategory.color,
      parentId: newCategory.parentId,
    })

    // Réinitialiser le formulaire
    setNewCategory({
      id: "", // Réinitialiser l'ID pour la prochaine catégorie
      name: "",
      color: "#6366f1",
      parentId: null,
    })

    toast({
      title: "Catégorie ajoutée",
      description: `La catégorie "${newCategory.name}" a été ajoutée avec succès (ID: ${id})`,
    })
  }

  // Start editing a category (inchangé)
  const startEditing = (category: Category) => {
    setEditingCategory(category.id)
    setEditForm({
      id: category.id,
      name: category.name,
      color: category.color,
    })
  }

  // Save edited category (inchangé)
  const saveCategory = () => {
    if (!editForm.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
        variant: "destructive",
      })
      return
    }

    updateCategory(editForm.id, {
      name: editForm.name.trim(),
      color: editForm.color,
    })

    setEditingCategory(null)

    toast({
      title: "Catégorie mise à jour",
      description: `La catégorie a été mise à jour avec succès`,
    })
  }

  // Delete a category (inchangé)
  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId)

    toast({
      title: "Catégorie supprimée",
      description: `La catégorie a été supprimée avec succès`,
    })
  }

  // Render a category and its children recursively (inchangé)
  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const isEditing = editingCategory === category.id

    return (
      <div key={category.id} className="category-item">
        <div
          className={`
            flex items-center p-2 rounded-md
            ${level > 0 ? "ml-6" : ""}
            ${isEditing ? "bg-muted" : "hover:bg-muted/50"}
          `}
        >
          {category.children.length > 0 && (
            <Button variant="ghost" size="icon" className="h-6 w-6 mr-1" onClick={() => toggleCategory(category.id)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}

          {!isEditing ? (
            <>
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color }} />
              <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="flex-1">
                {category.name} <span className="text-xs text-muted-foreground ml-2">(ID: {category.id})</span>
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="color"
                value={editForm.color}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-8 h-8 p-0 border-none"
              />
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="flex-1"
                placeholder="Nom de la catégorie"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={saveCategory}>
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => setEditingCategory(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isExpanded && category.children.length > 0 && (
          <div className="category-children">{category.children.map((child) => renderCategory(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">     
      <Button 
        variant="outline" 
        onClick={() => window.location.href = "/Editor"}
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l'éditeur
      </Button>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Ajouter une nouvelle catégorie</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Nouveau champ pour l'ID */}
            <div>
              <Label htmlFor="category-id">ID (optionnel)</Label>
              <Input
                id="category-id"
                value={newCategory.id}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                placeholder="Laisser vide pour générer automatiquement"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="category-name">Nom</Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nom de la catégorie"
              />
            </div>
            <div>
              <Label htmlFor="category-color">Couleur</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="category-color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-12 h-9 p-0"
                />
                <Input
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-parent">Catégorie parente</Label>
              <select
                id="category-parent"
                className="w-full p-2 border rounded-md"
                value={newCategory.parentId || ""}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    parentId: e.target.value ? e.target.value : null,
                  })
                }
              >
                <option value="">-- Catégorie principale --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} (ID: {category.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddCategory} className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Ajouter la catégorie
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Hiérarchie des catégories</h3>
        <div className="border rounded-md">
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {categoryTree.length > 0 ? (
                categoryTree.map((category) => renderCategory(category))
              ) : (
                <div className="p-4 text-center text-muted-foreground">Aucune catégorie n'a été créée</div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}