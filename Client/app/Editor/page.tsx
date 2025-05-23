"use client"
import Link from "next/link"
import { LayoutGrid, Package, LayoutPanelTop, Upload, BarChart4, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import styles from './page.module.css';


export default function Home() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [hoveredCard, setHoveredCard] = useState("editor")

  const cardColors = {
    editor: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
    display: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
    floor: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200" },
    ai: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
    library: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200" },
    import: { bg: "bg-pink-50", icon: "text-pink-600", border: "border-pink-200" },
    furniture_library: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200" },
    furniture_editor: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-200" }
  };

  const featureCards = [
    {
      id: 'import',
      icon: Upload,
      type: "import",
      title: t("feature.import.title"),
      description: t("feature.import.description"),
      buttonText: t("feature.import.button"),
      features: [
        t("feature.import.features.0"),
        t("feature.import.features.1"),
        t("feature.import.features.2"),
      ],
      href: "/product-import"
    }
    ,
    {
      id: 'library',
      icon: Package,
      type: "library",
      title: t("feature.library.title"),
      description: t("feature.library.description"),
      buttonText: t("feature.library.button"),
      features: [
        t("feature.library.features.0"),
        t("feature.library.features.1"),
        t("feature.library.features.2"),
      ],
      href: "/product-library"
    }
    ,
    {
      id: 'floor',
      icon: LayoutPanelTop,
      type: "floor",
      title: t("feature.floor.title"),
      description: t("feature.floor.description"),
      buttonText: t("feature.floor.button"),
      stats: { value: "40-60%", title: t("feature.floor.stats") },
      features: [
        t("feature.floor.features.0"),
        t("feature.floor.features.1"),
        t("feature.floor.features.2")
      ],
      href: "/floor-plan-editor"
    },
    {
      id: 'editor',
      icon: LayoutGrid,
      type: "editor",
      title: t("feature.editor.title"),
      description: t("feature.editor.description"),
      buttonText: t("feature.editor.buttonText"),
      stats: {
        value: "5-15%",  // si ce n'est pas à traduire, tu peux laisser tel quel
        title: t("feature.editor.statsTitle")
      },
      features: [
        t("feature.editor.features.0"),
        t("feature.editor.features.1"),
        t("feature.editor.features.2")
      ],
      href: "/planogram-editor"
    },
    {
      id: 'furniture_editor',
      icon: LayoutPanelTop,
      type: "furniture_editor",
      title: t("feature.furniture_editor.title"),
      description: t("feature.furniture_editor.description"),
      buttonText: t("feature.furniture_editor.button"),
      features: [
        t("feature.furniture_editor.features.0"),
        t("feature.furniture_editor.features.1"),
        t("feature.furniture_editor.features.2")
      ],
      href: "/furniture-editor"
    },
    {
      id: 'ai',
      icon: BarChart4,
      type: "ai",
      title: t("feature.ai.title"),
      description: t("feature.ai.description"),
      buttonText: t("feature.ai.button"),
      stats: { value: t("feature.ai.stats.value"), title: t("feature.ai.stats.title") },
      features: [
        t("feature.ai.features.0"),
        t("feature.ai.features.1"),
        t("feature.ai.features.2"),
      ],
      href: "/planogram-ia",
      isFeatured: true
    }
    ,
    {
      id: 'furniture_library',
      icon: Package,
      type: "furniture_library",
      title: t("feature.furniture_library.title"),
      description: t("feature.furniture_library.description"),
      buttonText: t("feature.furniture_library.button"),
      features: [
        t("feature.furniture_library.features.0"),
        t("feature.furniture_library.features.1"),
        t("feature.furniture_library.features.2"),
        t("feature.furniture_library.features.3")
      ],
      href: "/furniture-library"
    }
    ,
    {
      id: 'display',
        icon: LayoutPanelTop,
        type: "display",
        title: t("feature.display.title"),
        description: t("feature.display.description"),
        buttonText: t("feature.display.buttonText"),
        stats: {
          value: "20-30%",  
          title: t("feature.display.statsTitle")
        },
        features: [
          t("feature.display.features.0"),
          t("feature.display.features.1"),
          t("feature.display.features.2"),
          t("feature.display.features.3"),
          t("feature.display.features.4")
        ],
        href: "/store-display"
    }
    
    
    
  ];

  const activeCard = featureCards.find(card => card.id === hoveredCard) || featureCards[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 mt-12" dir={textDirection}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            SmartStore <span className="text-blue-600">{t("retail")}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
              {t("retailDescription")}
          </motion.p>
        </div>

        {/* Main content - Inversé pour l'arabe */}
        <div className="flex flex-col lg:flex-row gap-8 h-[70vh]">
          {/* Partie détails - à droite pour LTR, à gauche pour RTL */}
          {!isRTL ? (
            <>
              {/* Détails (gauche pour LTR) */}
              <div className="lg:w-3/5 h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCard.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white p-8 rounded-xl shadow-sm h-full flex flex-col border-2 ${cardColors[activeCard.type].border} relative overflow-y-auto`}
                  >
                    <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${cardColors[activeCard.type].bg} opacity-20`}></div>
                    <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${cardColors[activeCard.type].bg} opacity-10`}></div>

                    <div className="flex-grow">
                      <div className="mb-8 z-10">
                        {activeCard.stats ? (
                          <>
                            <div className="text-6xl font-bold text-gray-800 mb-2">{activeCard.stats.value}</div>
                            <div className="text-2xl font-semibold text-gray-700">{activeCard.stats.title}</div>
                          </>
                        ) : (
                          <div className="text-3xl font-bold text-gray-800 mb-4">{activeCard.title}</div>
                        )}
                        <p className="text-gray-600 mt-2 text-lg">{activeCard.description}</p>
                      </div>

                      <div className="space-y-5 mb-8 z-10">
                        {activeCard.features.map((feature, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center"
                          >
                            <div className={`h-12 w-12 rounded-lg ${cardColors[activeCard.type].bg} flex items-center justify-center mr-4 shadow-sm`}>
                              <activeCard.icon className={`h-6 w-6 ${cardColors[activeCard.type].icon}`} />
                            </div>
                            <span className="text-gray-700 text-lg">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="z-10 pt-4">
                      <Link href={activeCard.href}>
                        <Button className={`w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg`}>
                          {activeCard.buttonText} <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Cartes (droite pour LTR) */}
              <div className="lg:w-2/5 h-full overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  {featureCards.map((card) => (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => setHoveredCard(card.id)}
                      onClick={() => setHoveredCard(card.id)}
                      className={`p-5 rounded-xl cursor-pointer transition-all ${
                        hoveredCard === card.id 
                          ? `bg-white shadow-lg border-2 ${cardColors[card.type].border}` 
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`h-14 w-14 rounded-lg ${cardColors[card.type].bg} flex items-center justify-center mr-4 shadow-sm`}>
                          <card.icon className={`h-6 w-6 ${cardColors[card.type].icon}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">{card.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-1">{card.description}</p>
                        </div>
                        {card.isFeatured && (
                          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center shadow-sm">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t("new")} 
                          </span>
                        )}
                        <ChevronRight className={`h-5 w-5 ml-2 ${hoveredCard === card.id ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Cartes (droite pour RTL) */}
              <div className="lg:w-2/5 h-full overflow-y-auto pl-2 custom-scrollbar">
                <div className="space-y-4">
                  {featureCards.map((card) => (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => setHoveredCard(card.id)}
                      onClick={() => setHoveredCard(card.id)}
                      className={`p-5 rounded-xl cursor-pointer transition-all ${
                        hoveredCard === card.id 
                          ? `bg-white shadow-lg border-2 ${cardColors[card.type].border}` 
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`h-14 w-14 rounded-lg ${cardColors[card.type].bg} flex items-center justify-center ml-4 shadow-sm`}>
                          <card.icon className={`h-6 w-6 ${cardColors[card.type].icon}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">{card.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-1">{card.description}</p>
                        </div>
                        {card.isFeatured && (
                          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center shadow-sm">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t("new")} 
                          </span>
                        )}
                        <ChevronRight className={`h-5 w-5 mr-2 ${hoveredCard === card.id ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Détails (gauche pour RTL) */}
              <div className="lg:w-3/5 h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCard.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white p-8 rounded-xl shadow-sm h-full flex flex-col border-2 ${cardColors[activeCard.type].border} relative overflow-y-auto`}
                  >
                    <div className={`absolute -top-20 -left-20 w-64 h-64 rounded-full ${cardColors[activeCard.type].bg} opacity-20`}></div>
                    <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full ${cardColors[activeCard.type].bg} opacity-10`}></div>

                    <div className="flex-grow">
                      <div className="mb-8 z-10">
                        {activeCard.stats ? (
                          <>
                            <div className="text-6xl font-bold text-gray-800 mb-2">{activeCard.stats.value}</div>
                            <div className="text-2xl font-semibold text-gray-700">{activeCard.stats.title}</div>
                          </>
                        ) : (
                          <div className="text-3xl font-bold text-gray-800 mb-4">{activeCard.title}</div>
                        )}
                        <p className="text-gray-600 mt-2 text-lg">{activeCard.description}</p>
                      </div>

                      <div className="space-y-5 mb-8 z-10">
                        {activeCard.features.map((feature, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center"
                          >
                            <div className={`h-12 w-12 rounded-lg ${cardColors[activeCard.type].bg} flex items-center justify-center ml-4 shadow-sm`}>
                              <activeCard.icon className={`h-6 w-6 ${cardColors[activeCard.type].icon}`} />
                            </div>
                            <span className="text-gray-700 text-lg">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="z-10 pt-4">
                      <Link href={activeCard.href}>
                        <Button className={`w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg`}>
                          {activeCard.buttonText} <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-8 text-center text-white shadow-lg"
        >
         <h2
            className={`text-2xl font-bold mb-2 ${
              i18n.language === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            {t("retailDemo")}
          </h2>
          <p className="mb-6 text-blue-100 max-w-2xl mx-auto">
          {t("retailDemoDescription")}
          </p>
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8 text-lg font-semibold">
          {t("retailDemoBoutton")}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}