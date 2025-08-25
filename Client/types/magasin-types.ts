export interface Zone {
    id: number
    zone_id: string
    nom_zone: string
    magasin_id: string
    description: string
    emplacement: string | null
    longueur: number | null
    largeur: number | null
    hauteur: number | null
    temperature: number | null
    eclairage: string | null
    position_x: number
    position_y: number
    orientation: string | null
    date_creation: string
    date_modification: string
    couleur?: string
    population?: number
    superficie?: number
  }
  
  export interface Magasin {
    id: number
    magasin_id: string
    nom_magasin: string
    surface: string
    longueur: string
    largeur: string
    zones_configurees: number | null
    adresse: string
    entreprise_id: number
    date_creation: string
    date_modification: string
    ville?: string
    telephone?: string
    horaires?: string
    coordonnees?: { x: number; y: number }
  }
  
  export interface MagasinDetails extends Magasin {
    zones: Zone[]
  }
  
  export interface EntrepriseStats {
    totalMagasins: number
    magasins: Magasin[]
    totalZones: number
    surfaceTotal: number
  }
  
  export interface User {
    idUtilisateur?: string
    id?: string
    entreprises_id: number
  }
  
  export interface Structure {
    id: string
    type: "door" | "window"
    position_x: number
    position_y: number
    width: number
    height: number
    orientation: string
  }
  
  export interface NewZone {
    zone_id: string
    nom: string
    couleur: string
    description: string
    emplacement: string
    longueur: number
    largeur: number
    hauteur: number
    temperature: number
    eclairage: string
    position_x: number
    position_y: number
    orientation: string
  }
  
  export interface NewStructure {
    type: "door" | "window"
    position_x: number
    position_y: number
    width: number
    height: number
    orientation: string
  }
  