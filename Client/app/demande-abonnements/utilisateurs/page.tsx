"use client"

import { UtilisateursTable } from '@/components/back-office-entreprise/Dashboard-BackOffice/utilisateurs-table'

export default function UtilisateursPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <UtilisateursTable />
    </div>
  )
}