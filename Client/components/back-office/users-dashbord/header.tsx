"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import type { ActiveTab } from "./dashboard"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface HeaderProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const [isOpen, setIsOpen] = useState(false)

  const tabs = [
    { id: "dashboard" as ActiveTab, label: t("back.navBar.tabBord") },
    { id: "communication" as ActiveTab, label: t("back.navBar.communication") },
    { id: "training" as ActiveTab, label: t("back.navBar.gestionFormations") },
    { id: "faq" as ActiveTab, label: t("back.navBar.gestionFaqs") },
    { id: "users" as ActiveTab, label: t("back.navBar.gestionUtilisateurs") },
  ]

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId)
    setIsOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sticky top-0 z-40">
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex space-x-1 w-full justify-between">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors flex-1 text-center ${
              activeTab === tab.id
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span className="truncate">{tab.label}</span>
          </Button>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Sélectionnez une section</SheetDescription>
              </SheetHeader>
              <div className="grid gap-2 py-6">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => handleTabClick(tab.id)}
                    className={`justify-start text-left ${
                      activeTab === tab.id ? "bg-blue-500 text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h1>
        </div>
      </div>

      {/* Tablet Navigation */}
      <nav className="hidden md:flex lg:hidden space-x-1 mt-3">
        <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </nav>
    </header>
  )
}
