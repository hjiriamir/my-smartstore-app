"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  FileSpreadsheet, 
  Package, 
  FolderTree, 
  Settings, 
  Home, 
  BarChart3, 
  ShoppingBag, 
  LayoutGrid, 
  Tags, 
  HelpCircle, 
  Plus, 
  Bell,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function MainNav() {
  const pathname = usePathname()

  const mainRoutes = [
    {
      href: "/Dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/Dashboard",
    },
    {
      href: "/store-display",
      label: "Shop Display",
      icon: ShoppingBag,
      active:
        pathname === "/store-display" ||
        pathname === "/clothing-rack" ||
        pathname === "/furniture-library" ||
        pathname === "/furniture-editor",
    },
    {
      href: "/floor-planner",
      label: "Floor Planning",
      icon: LayoutGrid,
      active: pathname === "/floor-planner" || pathname === "/planogram-editor",
    },
    {
      href: "/categories",
      label: "Category Management",
      icon: FolderTree,
      active: pathname === "/categories",
    },
    {
      href: "/analytics",
      label: "Sales Summary",
      icon: BarChart3,
      active: pathname === "/analytics",
    },
  ]

  const productRoutes = [
    {
      href: "/product-library",
      label: "Products",
      icon: Package,
      active: pathname === "/product-library",
    },
    {
      href: "/product-import",
      label: "Import Products",
      icon: FileSpreadsheet,
      active: pathname === "/product-import",
    },
    {
      href: "/pricing",
      label: "Pricing",
      icon: Tags,
      active: pathname === "/pricing",
    },
  ]

  const supportRoutes = [
    {
      href: "/help",
      label: "Help",
      icon: HelpCircle,
      active: pathname === "/help",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <div className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center mr-10">
          <span className="text-xl font-bold text-blue-600">Smart</span>
          <span className="text-xl font-bold text-gray-800">Store</span>
        </Link>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {mainRoutes.map((route) => {
            const Icon = route.icon
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-200 hover:text-blue-600 whitespace-nowrap group relative",
                  route.active 
                    ? "text-blue-600 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-blue-600 before:-mb-[17px]" 
                    : "text-gray-600 hover:text-blue-600"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 mr-2 transition-transform duration-200",
                  "group-hover:scale-110"
                )} />
                {route.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {/* Search */}
          <div className="hidden lg:flex items-center relative">
            <Search className="h-4 w-4 absolute left-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-9 w-56 rounded-full bg-gray-100 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>


          {/* User Profile */}
          <div className="flex items-center space-x-2 ml-4">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-blue-50">
              <span className="text-xs font-semibold text-blue-700">JD</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:inline">John Doe</span>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="border-t bg-gray-50">
        <div className="container mx-auto flex h-12 items-center px-4 overflow-x-auto">
          <nav className="flex items-center space-x-6">
            {productRoutes.map((route) => {
              const Icon = route.icon
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors duration-200 whitespace-nowrap group",
                    route.active ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 mr-2 transition-transform duration-200",
                    "group-hover:scale-110"
                  )} />
                  {route.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center space-x-4">
            <nav className="flex items-center space-x-6">
              {supportRoutes.map((route) => {
                const Icon = route.icon
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center text-sm font-medium transition-colors duration-200 whitespace-nowrap group",
                      route.active ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 mr-2 transition-transform duration-200",
                      "group-hover:scale-110"
                    )} />
                    {route.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}