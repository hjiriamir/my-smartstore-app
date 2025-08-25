// app/demande-abonnements/layout.tsx
"use client"

import { AppSidebar } from '@/components/back-office-entreprise/Dashboard-BackOffice/app-sidebar'
import { DashboardHeader } from '@/components/back-office-entreprise/Dashboard-BackOffice/dashboard-header'
import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar' // Importez le SidebarProvider

const pageTitles: Record<string, string> = {
  '/demande-abonnements': 'Dashboard',
  '/demande-abonnements/demandes': "Demandes d'Abonnement",
  '/demande-abonnements/entreprises': 'Entreprises',
  '/demande-abonnements/utilisateurs': 'Utilisateurs',
  '/demande-abonnements/analytics': 'Analytics',
  '/demande-abonnements/messages': 'Messages',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'Dashboard'

  return (
    <SidebarProvider> {/* Ajoutez le provider ici */}
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex flex-col w-full md:pl-64 transition-all duration-300">
          <DashboardHeader title={title} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}