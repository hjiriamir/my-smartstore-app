"use client"
import Link from "next/link"
import { LayoutGrid, Package, LayoutPanelTop, Upload, Sparkles, ChevronRight } from "lucide-react"
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
    editor: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200", gradient: "from-blue-500 to-blue-600" },
    display: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200", gradient: "from-emerald-500 to-emerald-600" },
    floor: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200", gradient: "from-amber-500 to-amber-600" },
    library: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200", gradient: "from-orange-500 to-orange-600" },
    import: { bg: "bg-pink-50", icon: "text-pink-600", border: "border-pink-200", gradient: "from-pink-500 to-pink-600" },
    furniture_library: { bg: "bg-teal-50", icon: "text-teal-600", border: "border-teal-200", gradient: "from-teal-500 to-teal-600" },
    furniture_editor: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-200", gradient: "from-indigo-500 to-indigo-600" }
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
    },
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
    },
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
        value: "5-15%",
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
    },
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
    <div className={styles.container} dir={textDirection}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={styles.header}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.title}
          >
            SmartStore <span className={styles.titleHighlight}>{t("retail")}</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Link href="/Dashboard">
              <Button className="group h-12 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center gap-2">
                  <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isRTL ? 'rotate-180' : 'rotate-180'}`} />
                  {t("backToDashboard")}
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    <ChevronRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </span>
                </span>
              </Button>
            </Link>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={styles.subtitle}
          >
            {t("retailDescription")}
          </motion.p>
        </div>

        {/* Main content */}
        <div className={`${styles.mainContent} ${isRTL ? 'rtl' : ''}`} style={{
          '--cards-order': isRTL ? 2 : 1,
          '--details-order': isRTL ? 1 : 2
        } as React.CSSProperties}>
          {/* Cards Column */}
          <div className={`${styles.cardsColumn} ${styles.customScrollbar}`}>
            <div className={styles.cardsGrid}>
              {featureCards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onClick={() => setHoveredCard(card.id)}
                  className={`${styles.card} ${hoveredCard === card.id ? styles.cardActive : ''}`}
                  style={{
                    borderColor: hoveredCard === card.id ? cardColors[card.type].border.split('-')[1] : undefined
                  }}
                >
                  <div className={styles.cardContent}>
                    <div className={styles.cardIconContainer} style={{ backgroundColor: cardColors[card.type].bg.split('-')[1] }}>
                      <card.icon className={cardColors[card.type].icon} />
                    </div>
                    <div className={styles.cardText}>
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      <p className={styles.cardDescription}>{card.description}</p>
                    </div>
                    <ChevronRight className={`${styles.cardArrow} ${hoveredCard === card.id ? styles.cardArrowActive : ''}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div className={styles.detailsColumn}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                className={styles.detailsContainer}
                style={{
                  borderColor: cardColors[activeCard.type].border.split('-')[1]
                }}
              >
                {/* Decorative elements */}
                <div 
                  className={styles.detailsBgCircle1} 
                  style={{ 
                    backgroundColor: cardColors[activeCard.type].bg.split('-')[1],
                    [isRTL ? 'left' : 'right']: '-5rem'
                  }}
                ></div>
                <div 
                  className={styles.detailsBgCircle2} 
                  style={{ 
                    backgroundColor: cardColors[activeCard.type].bg.split('-')[1],
                    [isRTL ? 'right' : 'left']: '-2.5rem'
                  }}
                ></div>

                <div className="flex-grow">
                  <div className="mb-6 md:mb-8 z-10">
                    {activeCard.stats ? (
                      <div className="mb-6">
                        <div className={styles.statsValue}>{activeCard.stats.value}</div>
                        <div className={styles.statsTitle}>{activeCard.stats.title}</div>
                      </div>
                    ) : (
                      <h2 className={styles.detailsTitle}>{activeCard.title}</h2>
                    )}
                    <p className={styles.detailsDescription}>{activeCard.description}</p>
                  </div>

                  <div className={styles.featuresList}>
                    {activeCard.features.map((feature, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={styles.featureItem}
                      >
                        <div 
                          className={styles.featureIconContainer}
                          style={{ backgroundColor: cardColors[activeCard.type].bg.split('-')[1] }}
                        >
                          <activeCard.icon className={cardColors[activeCard.type].icon} />
                        </div>
                        <span className={styles.featureText}>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="z-10 pt-4">
                  <Link href={activeCard.href}>
                  <Button
  className={`w-full h-12 font-semibold text-white rounded-md bg-gradient-to-r ${cardColors[activeCard.type].gradient} hover:brightness-110 transition`}
>
  {activeCard.buttonText}
  <ChevronRight className="ml-2 w-5 h-5" />
</Button>

                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={styles.footerCta}
        >
          <h2 className={`${styles.footerTitle} ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("retailDemo")}
          </h2>
          <p className={`${styles.footerDescription} ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("retailDemoDescription")}
          </p>
          <Button 
            variant="secondary" 
            className={styles.footerButton}
          >
            {t("retailDemoBoutton")}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}