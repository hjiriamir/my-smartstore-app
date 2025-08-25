import { useState, useEffect } from 'react'

type StatsData = {
  pendingRequests?: number;
  companiesCount?: number;
  activeUsers?: number;
}

type Activity = {
  id: number;
  nom: string;
  prenom: string;
  entreprise: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const useFetchStats = () => {
  const [stats, setStats] = useState<StatsData>({})
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch all data in parallel
        const [pendingRes, companiesRes, usersRes, activitiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/demande/getDemmandesAttente`),
          fetch(`${API_BASE_URL}/entreprises/entreprises`),
          fetch(`${API_BASE_URL}/auth1/getAllUsersActif`),
          fetch(`${API_BASE_URL}/demande/getAllDemandes`)
        ])

        if (!pendingRes.ok || !companiesRes.ok || !usersRes.ok || !activitiesRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const pendingData = await pendingRes.json()
        const companiesData = await companiesRes.json()
        const usersData = await usersRes.json()
        const activitiesData = await activitiesRes.json()

        setStats({
          pendingRequests: pendingData.count,
          companiesCount: companiesData.count,
          activeUsers: usersData.totalUtilisateurs
        })

        setActivities(
          activitiesData
            .sort((a: Activity, b: Activity) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
            .slice(0, 4)
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { stats, activities, isLoading, error }
}