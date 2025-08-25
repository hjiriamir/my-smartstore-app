"use client"

import { EntreprisesTable } from '@/components/back-office-entreprise/Dashboard-BackOffice/entreprises-table'

export default function EntreprisesPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <EntreprisesTable />
    </div>
  )
}