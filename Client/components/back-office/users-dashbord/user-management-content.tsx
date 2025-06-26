import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Crown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

export function UserManagementContent() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState({
    users: false,
    magasins: false,
    addUser: false,
    entreprise: false
  })
  const [error, setError] = useState("")
  const [currentUserEntrepriseId, setCurrentUserEntrepriseId] = useState(null)
  const [entrepriseName, setEntrepriseName] = useState("")
  const [magasins, setMagasins] = useState([])
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMagasin, setSelectedMagasin] = useState("all")
const [selectedRole, setSelectedRole] = useState("all")
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    magasin_id: ""
  })

  // Récupérer l'utilisateur connecté et son entreprise
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(prev => ({...prev, entreprise: true}))
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const response = await fetch("http://localhost:8081/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'utilisateur")
        }

        const data = await response.json()
        const entrepriseId = data.user?.entreprises_id || data.entreprises_id
        
        setCurrentUserEntrepriseId(entrepriseId)
        
        // Récupérer le nom de l'entreprise
        if (entrepriseId) {
          const entrepriseResponse = await fetch(
            `http://localhost:8081/api/demande/getEntrepriseById/${entrepriseId}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            }
          )
          
          if (entrepriseResponse.ok) {
            const entrepriseData = await entrepriseResponse.json()
            setEntrepriseName(entrepriseData.nomEntreprise || "Votre entreprise")
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
        setError("Erreur lors de la récupération de l'utilisateur")
      } finally {
        setLoading(prev => ({...prev, entreprise: false}))
      }
    }

    fetchCurrentUser()
  }, [])

  // Récupérer les utilisateurs de l'entreprise
  useEffect(() => {
    if (!currentUserEntrepriseId) return

    const fetchUsers = async () => {
      try {
        setLoading(prev => ({...prev, users: true}))
        const token = localStorage.getItem("token")
        
        const response = await fetch(
          `http://localhost:8081/api/auth1/users/excluding-admin/${currentUserEntrepriseId}`, 
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs")
        }

        const data = await response.json();
        setUsers(data.map(user => ({
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          magasin_id: user.magasin_id || '',
        })));
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Erreur lors de la récupération des utilisateurs")
      } finally {
        setLoading(prev => ({...prev, users: false}))
      }
    }

    fetchUsers()
  }, [currentUserEntrepriseId])

  // Récupérer les magasins de l'entreprise
  useEffect(() => {
    if (!currentUserEntrepriseId) return

    const fetchMagasins = async () => {
      try {
        setLoading(prev => ({...prev, magasins: true}))
        const token = localStorage.getItem("token")
        
        const response = await fetch(
          `http://localhost:8081/api/magasins/getMagasinsByEntrepriseId/${currentUserEntrepriseId}`, 
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des magasins")
        }

        const data = await response.json()
        setMagasins(data)
      } catch (error) {
        console.error("Error fetching magasins:", error)
        setError("Erreur lors de la récupération des magasins")
      } finally {
        setLoading(prev => ({...prev, magasins: false}))
      }
    }

    fetchMagasins()
  }, [currentUserEntrepriseId])

  // Filtrer les utilisateurs en fonction des critères de recherche
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.magasin_id?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesMagasin = 
        selectedMagasin === "all" || !selectedMagasin ? true : user.magasin_id === selectedMagasin
      const matchesRole = 
        selectedRole === "all" || !selectedRole ? true : user.role === selectedRole
      
      return matchesSearch && matchesMagasin && matchesRole
    })
  }, [users, searchTerm, selectedMagasin, selectedRole])

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      setError("Tous les champs obligatoires doivent être remplis");
      return;
    }
    try {
      setLoading(prev => ({...prev, addUser: true}))
      setError("")
      const token = localStorage.getItem("token")
      
      const response = await fetch(
        "http://localhost:8081/api/auth1/newUser", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            entreprises_id: currentUserEntrepriseId,
            magasin_id: newUser.magasin_id
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'ajout de l'utilisateur")
      }

      const data = await response.json()
      
      setUsers(prev => [...prev, data.user])
      
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
        magasin_id: ""
      })
      
      setIsAddUserDialogOpen(false)
    } catch (error) {
      console.error("Error adding user:", error)
      setError(error.message || "Erreur lors de l'ajout de l'utilisateur")
    } finally {
      setLoading(prev => ({...prev, addUser: false}))
    }
  }

  const refreshUsers = async () => {
    if (!currentUserEntrepriseId) return;
  
    try {
      setLoading(prev => ({...prev, users: true}));
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `http://localhost:8081/api/auth1/users/excluding-admin/${currentUserEntrepriseId}`, 
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
  
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
  
      const data = await response.json();
      setUsers(data.map(user => ({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        magasin_id: user.magasin_id || '',
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Erreur lors de la récupération des utilisateurs");
    } finally {
      setLoading(prev => ({...prev, users: false}));
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case "store_manager":
        return <Badge variant="secondary">Gérant de magasin</Badge>
      case "chef de rayon":
        return <Badge variant="secondary">Chef de rayon</Badge>
      case "back_office_user":
        return <Badge variant="secondary">Back office</Badge>
      case "seller":
        return <Badge variant="secondary">Vendeur</Badge>
      case "cashier":
        return <Badge variant="secondary">Caissier</Badge>
      case "support_technician":
        return <Badge variant="secondary">Support technique</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default">
            <UserCheck className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        )
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>
      case "suspended":
        return (
          <Badge variant="destructive">
            <UserX className="w-3 h-3 mr-1" />
            Suspendu
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-2">
            {entrepriseName ? `Utilisateurs de ${entrepriseName}` : "Gérez les comptes utilisateurs et leurs permissions"}
          </p>
        </div>
        
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-hidden">
            <ScrollArea className="h-full max-h-[80vh] pr-4">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Nom complet"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Mot de passe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="store_manager">Gérant de magasin</SelectItem>
                      <SelectItem value="chef de rayon">Chef de rayon</SelectItem>
                      <SelectItem value="back_office_user">Back office</SelectItem>
                      <SelectItem value="seller">Vendeur</SelectItem>
                      <SelectItem value="cashier">Caissier</SelectItem>
                      <SelectItem value="support_technician">Support technique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={entrepriseName}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="magasin">Magasin</Label>
                  <Select
                    value={newUser.magasin_id}
                    onValueChange={(value) => setNewUser({...newUser, magasin_id: value})}
                    disabled={loading.magasins}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading.magasins ? "Chargement..." : "Sélectionner un magasin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {magasins.map((magasin) => (
                        <SelectItem key={magasin.id} value={magasin.magasin_id}>
                          {magasin.nom_magasin} ({magasin.magasin_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <Button 
                  onClick={handleAddUser}
                  disabled={loading.addUser}
                  className="w-full"
                >
                  {loading.addUser ? "Ajout en cours..." : "Ajouter l'utilisateur"}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Dans votre entreprise</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {entrepriseName ? `Utilisateurs de ${entrepriseName}` : "Liste des utilisateurs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="mb-4 flex gap-2">
  <Input 
    placeholder="Rechercher un utilisateur..." 
    className="flex-1" 
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <Select
    value={selectedMagasin}
    onValueChange={setSelectedMagasin}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Tous les magasins" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les magasins</SelectItem>
      {magasins.map((magasin) => (
        <SelectItem key={magasin.id} value={magasin.magasin_id}>
          {magasin.nom_magasin}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <Select
    value={selectedRole}
    onValueChange={setSelectedRole}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Tous les rôles" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les rôles</SelectItem>
      <SelectItem value="admin">Admin</SelectItem>
      <SelectItem value="store_manager">Gérant de magasin</SelectItem>
      <SelectItem value="chef de rayon">Chef de rayon</SelectItem>
      <SelectItem value="back_office_user">Back office</SelectItem>
      <SelectItem value="seller">Vendeur</SelectItem>
      <SelectItem value="cashier">Caissier</SelectItem>
      <SelectItem value="support_technician">Support technique</SelectItem>
    </SelectContent>
  </Select>
  <Button variant="outline" onClick={refreshUsers} disabled={loading.users}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${loading.users ? 'animate-spin' : ''}`}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  </Button>
  <Button variant="outline">
    <Search className="h-4 w-4" />
  </Button>
</div>
          
          
          {loading.users ? (
            <div className="flex justify-center py-8">
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">{user.name}</h3>
                              {getRoleBadge(user.role)}
                              {getStatusBadge(user.status || "active")}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>Magasin: {user.magasin_id || "Non attribué"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center py-8">
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}