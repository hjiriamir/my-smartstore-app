"use client"
import Link from "next/link"
import { LayoutGrid, Package, LayoutPanelTop, Upload, BarChart4, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import { motion } from "framer-motion"

export default function Home() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // Color configuration for each card type
  const cardColors = {
    editor: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    display: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white"
    },
    floor: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700 text-white"
    },
    library: {
      bg: "bg-violet-50",
      icon: "text-violet-600",
      button: "bg-violet-600 hover:bg-violet-700 text-white"
    },
    import: {
      bg: "bg-rose-50",
      icon: "text-rose-600",
      button: "bg-rose-600 hover:bg-rose-700 text-white"
    },
    ai: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      button: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
    }
  }

  // Function to create a card with consistent RTL support
  const FeatureCard = ({ icon, type, title, description, content, buttonText, href, isFeatured = false }) => {
    const IconComponent = icon
    const colors = cardColors[type]

    return (
      <motion.div variants={item}>
        <Card
          className={`flex flex-col h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group ${
            isFeatured ? "border-2 border-purple-200" : ""
          }`}
          dir={textDirection}
        >
          {isFeatured && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-80"></div>
              <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center`}>
                <Sparkles className="h-3 w-3 mr-1" />
                {t("featured")}
              </div>
            </>
          )}
          
          <div className="relative z-10 h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className={`flex ${isRTL ? "flex-row-reverse justify-between" : "flex-row justify-between"}`}>
                <CardTitle className={`text-lg font-semibold text-gray-800 ${isRTL ? "text-right" : "text-left"}`}>
                  {title}
                </CardTitle>
                <div
                  className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
              <CardDescription className={`mt-3 ${isRTL ? "text-right" : "text-left"} text-gray-600`}>
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-grow">
              <p className={`text-sm text-gray-600 ${isRTL ? "text-right" : "text-left"}`}>{content}</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                asChild
                className={`w-full ${colors.button} transition-all shadow-md hover:shadow-lg h-10`}
              >
                <Link href={href}>{buttonText}</Link>
              </Button>
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="mt-12">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={textDirection}>
        <div className="container mx-auto px-4 py-12">
          {/* Header with improved styling */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Planogram Solution
            </h1>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${isRTL ? "text-right" : "text-left"}`}>
              {t("platformDescription")}
            </p>
          </motion.div>

          {/* Feature cards grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Planogram Editor Card */}
            <FeatureCard
              icon={LayoutGrid}
              type="editor"
              title={t("planogramEditor")}
              description={t("createManagePlanograms")}
              content={t("arrangeProducts")}
              buttonText={t("openEditor")}
              href="/planogram-editor"
            />

            {/* Shop Display Card */}
            <FeatureCard
              icon={LayoutPanelTop}
              type="display"
              title={t("shopDisplay")}
              description={t("enhanceLayout")}
              content={t("designCustomize")}
              buttonText={t("openShopDisplay")}
              href="/store-display"
            />

            {/* Floor Plan Editor Card */}
            <FeatureCard
              icon={LayoutPanelTop}
              type="floor"
              title={t("floorPlanEditor")}
              description={t("designStoreLayout")}
              content={t("createOptimize")}
              buttonText={t("openEditor")}
              href="/floor-plan-editor"
            />

            {/* Product Library Card */}
            <FeatureCard
              icon={Package}
              type="library"
              title={t("productLibrary")}
              description={t("manageCatalog")}
              content={t("viewUpdate")}
              buttonText={t("openLibrary")}
              href="/product-library"
            />

            {/* Product Import Card */}
            <FeatureCard
              icon={Upload}
              type="import"
              title={t("productImport.title")}
              description={t("importFromFile")}
              content={t("bulkImport")}
              buttonText={t("importProducts")}
              href="/product-import"
            />

            {/* AI Planograms Card - Featured Card */}
            <FeatureCard
              icon={BarChart4}
              type="ai"
              title={t("automatedAIPlanograms")}
              description={t("optimizeWithAI")}
              content={t("generateAutomatically")}
              buttonText={t("discoverAI")}
              href="/planogram-ia"
              isFeatured={true}
            />

            {/* furniture Library Card */}
            <FeatureCard
              icon={Package}
              type="library"
              title={t("furnitureLibrary")}
              description={t("manageFurniture")}
              content={t("furnitureUpdate")}
              buttonText={t("openLibrary")}
              href="/furniture-library"
            />

          </motion.div>
        </div>
      </div>
    </div>
  )
}