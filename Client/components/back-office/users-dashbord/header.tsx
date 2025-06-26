"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, User, Settings } from "lucide-react"
import type { ActiveTab } from "./dashboard"

interface HeaderProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { id: "dashboard" as ActiveTab, label: "Tableau de bord" },
    { id: "communication" as ActiveTab, label: "Communication" },
    { id: "training" as ActiveTab, label: "Gestion des formations" },
    { id: "faq" as ActiveTab, label: "Gestion des FAQ" },
    { id: "users" as ActiveTab, label: "Gestion des utilisateurs" },
  ]

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <nav className="flex space-x-1 w-full justify-between">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 text-center ${
              activeTab === tab.id
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </nav>
    </header>
  )
}