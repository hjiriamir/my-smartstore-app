"use client"
import "./globals.css"
import { usePathname } from "next/navigation"
import Header from "../components/header-footer/Header"
import Footer from "../components/header-footer/footer"
import TopBanner from "../components/back-office/TopBanner"
import { AuthProvider } from "../src/context/AuthContext"
import { type ReactNode, useEffect, useState } from "react"
import ProtectedRoute from "./ProtectedRoute"

const noHeaderFooterRoutes = [
  "/Dashboard",
  "/DashboardEntreprise",
  "/ListeDemandes",
  "/Essai",
  "/AbonnementList",
  "/UserManagement",
  "/TopBanner",
  "/Planogram",
  "/FloorPlanEditor",
  "/AbonnementList",
  "/reset-password",
  "/Editor",
  "/floor-plan-editor",
  "/planogram-editor",
  "/clothing-rack",
  "/product-import",
  "/store-display",
  "/furniture-editor",
  "/furniture-library",
  "/categories",
  "/product-library",
  "/planogram-ia",
  "/management-page",
  "/category-management",
  "/magasin-management",
  "/zones-management",
  "/combined-management",
  "/display-data",
  "/api",
  "/user-management",
  "/orders",
  "/suppliers",
  "/products",
  "/marketing",
  "/marketing-strategy",
  "/shelf-labels",
  "/shop-pillars",
]

const topBannerRoutes = [
  "/Dashboard",
  "/Editor",
  "/planogram-editor",
  "/product-import",
  "/product-library",
  "/store-display",
  "/planogram-ia",
  "/floor-plan-editor",
  "/furniture-library",
  "/furniture-editor",
  "/management-page",
  "/category-management",
  "/magasin-management",
  "/zones-management",
  "/combined-management",
  "/display-data",
  "/api",
  "/user-management",
  "/orders",
  "/suppliers",
  "/products",
  "/marketing",
  "/marketing-strategy",
  "/shelf-labels",
  "/shop-pillars",
]

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fonction pour vérifier si le header/footer doit être affiché
  const shouldShowHeaderFooter = () => {
    if (!mounted) return false
    return !noHeaderFooterRoutes.some((route) => pathname.startsWith(route))
  }

  // Fonction pour vérifier si le TopBanner doit être affiché
  const shouldShowTopBanner = () => {
    if (!mounted) return false
    return topBannerRoutes.some((route) => pathname.startsWith(route))
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProtectedRoute>
            {mounted && shouldShowHeaderFooter() && <Header key={pathname} />}
            {mounted && shouldShowTopBanner() && <TopBanner />}
            <main>{children}</main>
            {mounted && shouldShowHeaderFooter() && <Footer />}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  )
}
