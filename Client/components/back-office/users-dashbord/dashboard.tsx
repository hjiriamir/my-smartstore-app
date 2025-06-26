"use client"

import { useState } from "react"
import { Header } from "./header"
import { DashboardContent } from "./dashboard-content"
import { CommunicationContent } from "./communication-content"
import { TrainingContent } from "./training-content"
import { FAQContent } from "./faq-content"
import { UserManagementContent } from "./user-management-content"

export type ActiveTab = "dashboard" | "communication" | "training" | "faq" | "users"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />
      case "communication":
        return <CommunicationContent />
      case "training":
        return <TrainingContent />
      case "faq":
        return <FAQContent />
      case "users":
        return <UserManagementContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-14">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-6">{renderContent()}</main>
    </div>
  )
}
