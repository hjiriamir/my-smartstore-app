"use client"

import { StatsCards } from '@/components/back-office-entreprise/Dashboard-BackOffice/stats-cards'
import { RecentActivity } from '@/components/back-office-entreprise/Dashboard-BackOffice/recent-activity'
import { useFetchStats } from '@/hooks/use-fetch-stats'

export default function DemandeAbonnementsPage() {
  const { stats, activities, isLoading, error } = useFetchStats()

  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      <div className="space-y-6">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <StatsCards 
            pendingRequests={stats?.pendingRequests} 
            companiesCount={stats?.companiesCount} 
            activeUsers={stats?.activeUsers} 
            loading={isLoading}
          />
        </div>
        <div className="w-full">
          <RecentActivity 
            activities={activities} 
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}