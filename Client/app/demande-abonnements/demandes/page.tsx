"use client"

import { DemandesTable } from '@/components/back-office-entreprise/Dashboard-BackOffice/demandes-table'

export default function DemandesPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <DemandesTable />
    </div>
  )
}