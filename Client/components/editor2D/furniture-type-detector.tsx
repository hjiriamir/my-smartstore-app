// Nouveau fichier pour améliorer la détection des types de meubles

export interface FurnitureTypeInfo {
    id: string
    name: string
    description: string
    color: string
    characteristics: {
      minHeight?: number
      maxHeight?: number
      minWidth?: number
      maxWidth?: number
      minDepth?: number
      maxDepth?: number
      typical_sections?: number[]
      typical_slots?: number[]
    }
  }
  
  export const FURNITURE_TYPES: Record<string, FurnitureTypeInfo> = {
    planogram: {
      id: "planogram",
      name: "Planogramme Standard",
      description: "Présentoir standard avec étagères",
      color: "#27ae60",
      characteristics: {
        minHeight: 1.2,
        maxHeight: 2.5,
        typical_sections: [3, 4, 5],
        typical_slots: [4, 5, 6, 8],
      },
    },
    gondola: {
      id: "gondola",
      name: "Gondole",
      description: "Présentoir double face central",
      color: "#2c3e50",
      characteristics: {
        minWidth: 2.0,
        minDepth: 1.0,
        typical_sections: [4, 5, 6],
        typical_slots: [8, 10, 12],
      },
    },
    shelves: {
      id: "shelves",
      name: "Étagères",
      description: "Système d'étagères modulaires",
      color: "#ecf0f1",
      characteristics: {
        minHeight: 1.0,
        maxHeight: 3.0,
        typical_sections: [3, 4, 5, 6],
        typical_slots: [6, 8, 10],
      },
    },
    clothing_rack: {
      id: "clothing_rack",
      name: "Portant à Vêtements",
      description: "Portant pour vêtements suspendus",
      color: "#34495e",
      characteristics: {
        minHeight: 1.5,
        maxHeight: 2.2,
        maxWidth: 2.0,
        maxDepth: 0.8,
        typical_sections: [2, 3],
        typical_slots: [4, 6, 8],
      },
    },
    wall_display: {
      id: "wall_display",
      name: "Présentoir Mural",
      description: "Présentoir fixé au mur",
      color: "#95a5a6",
      characteristics: {
        minHeight: 1.5,
        maxDepth: 0.5,
        typical_sections: [3, 4, 5],
        typical_slots: [6, 8, 10],
      },
    },
    accessory_display: {
      id: "accessory_display",
      name: "Présentoir Accessoires",
      description: "Présentoir pour petits accessoires",
      color: "#e74c3c",
      characteristics: {
        maxHeight: 1.8,
        maxWidth: 1.5,
        typical_sections: [3, 4],
        typical_slots: [4, 6, 8],
      },
    },
    modular_cube: {
      id: "modular_cube",
      name: "Cube Modulaire",
      description: "Système de cubes empilables",
      color: "#9b59b6",
      characteristics: {
        minWidth: 0.8,
        maxWidth: 1.5,
        minHeight: 0.8,
        maxHeight: 1.5,
        typical_sections: [2, 3, 4],
        typical_slots: [2, 3, 4],
      },
    },
    table: {
      id: "table",
      name: "Table de Présentation",
      description: "Table pour présentation de produits",
      color: "#d35400",
      characteristics: {
        maxHeight: 1.2,
        minWidth: 1.0,
        typical_sections: [1, 2],
        typical_slots: [4, 6, 8],
      },
    },
    refrigerator: {
      id: "refrigerator",
      name: "Réfrigérateur",
      description: "Réfrigérateur vitré",
      color: "#1abc9c",
      characteristics: {
        minHeight: 1.8,
        maxHeight: 2.5,
        minWidth: 1.2,
        typical_sections: [3, 4, 5],
        typical_slots: [4, 6, 8],
      },
    },
    refrigerated_showcase: {
      id: "refrigerated_showcase",
      name: "Vitrine Réfrigérée",
      description: "Vitrine réfrigérée horizontale",
      color: "#16a085",
      characteristics: {
        maxHeight: 1.5,
        minWidth: 1.5,
        minDepth: 0.8,
        typical_sections: [2, 3],
        typical_slots: [6, 8, 10],
      },
    },
    clothing_display: {
      id: "clothing_display",
      name: "Présentoir Vêtements",
      description: "Présentoir mixte pour vêtements",
      color: "#8e44ad",
      characteristics: {
        minHeight: 1.5,
        maxHeight: 2.2,
        typical_sections: [3, 4],
        typical_slots: [4, 6, 8],
      },
    },
    clothing_wall: {
      id: "clothing_wall",
      name: "Mur de Vêtements",
      description: "Mur complet pour vêtements",
      color: "#2980b9",
      characteristics: {
        minHeight: 2.0,
        minWidth: 2.0,
        maxDepth: 0.6,
        typical_sections: [4, 5, 6],
        typical_slots: [8, 10, 12],
      },
    },
  }
  
  export function detectFurnitureTypeAdvanced(furniture: any): string {
    const { largeur = 0, hauteur = 0, profondeur = 0, furniture_type_name = "", furniture_type_id } = furniture
    const width = largeur / 100
    const height = hauteur / 100
    const depth = profondeur / 100
    const sections = furniture.nb_etageres_unique_face || 0
    const slots = furniture.nb_colonnes_unique_face || 0
  
    // Score chaque type de meuble
    const scores: Record<string, number> = {}
  
    Object.entries(FURNITURE_TYPES).forEach(([typeKey, typeInfo]) => {
      let score = 0
      const char = typeInfo.characteristics
  
      // Vérification des dimensions
      if (char.minHeight && height >= char.minHeight) score += 10
      if (char.maxHeight && height <= char.maxHeight) score += 10
      if (char.minWidth && width >= char.minWidth) score += 10
      if (char.maxWidth && width <= char.maxWidth) score += 10
      if (char.minDepth && depth >= char.minDepth) score += 10
      if (char.maxDepth && depth <= char.maxDepth) score += 10
  
      // Vérification des sections typiques
      if (char.typical_sections && char.typical_sections.includes(sections)) score += 15
  
      // Vérification des slots typiques
      if (char.typical_slots && char.typical_slots.includes(slots)) score += 15
  
      // Bonus pour correspondance de nom
      const typeName = furniture_type_name.toLowerCase()
      if (typeName.includes(typeKey) || typeName.includes(typeInfo.name.toLowerCase())) {
        score += 25
      }
  
      // Bonus pour correspondance d'ID
      if (furniture_type_id) {
        const expectedId = Object.keys(FURNITURE_TYPES).indexOf(typeKey) + 1
        if (furniture_type_id === expectedId) {
          score += 30
        }
      }
  
      scores[typeKey] = score
    })
  
    // Retourne le type avec le meilleur score
    const bestType = Object.entries(scores).reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b))[0]
  
    console.log("Furniture detection scores:", scores, "Selected:", bestType)
  
    return bestType
  }
  
  export function getFurnitureColor(type: string): string {
    return FURNITURE_TYPES[type]?.color || "#7f8c8d"
  }
  
  export function getFurnitureInfo(type: string): FurnitureTypeInfo | null {
    return FURNITURE_TYPES[type] || null
  }
  