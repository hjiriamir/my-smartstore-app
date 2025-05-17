import { CategoryManager } from "@/components/editor2D/category-manager"

export default function CategoriesPage() {
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Catégories</h1>
      <CategoryManager />
    </div>
  )
}
