import { orientations } from "@/types/magasin-constants"
import type { Zone, NewZone } from "@/types/magasin-types"

export const getOrientationDegrees = (orientation: string): number => {
  const found = orientations.find((o) => o.value === orientation)
  return found ? found.degrees : 0
}

export const generateZoneId = (existingZones: Zone[]): string => {
  const existingIds = existingZones.map((zone) => zone.zone_id)
  let counter = 1
  let newId = `Z${counter.toString().padStart(3, "0")}`

  while (existingIds.includes(newId)) {
    counter++
    newId = `Z${counter.toString().padStart(3, "0")}`
  }

  return newId
}

export const checkZoneConflicts = (
  zone: NewZone,
  existingZones: Zone[],
  magasinLongueur: number,
  magasinLargeur: number,
): string[] => {
  const conflicts: string[] = []

  if (zone.position_x + zone.longueur > magasinLongueur) {
    conflicts.push("La zone dépasse la longueur du magasin")
  }
  if (zone.position_y + zone.largeur > magasinLargeur) {
    conflicts.push("La zone dépasse la largeur du magasin")
  }
  if (zone.position_x < 0 || zone.position_y < 0) {
    conflicts.push("La position ne peut pas être négative")
  }

  existingZones.forEach((existingZone) => {
    const overlap = !(
      zone.position_x >= existingZone.position_x + (existingZone.longueur || 0) ||
      zone.position_x + zone.longueur <= existingZone.position_x ||
      zone.position_y >= existingZone.position_y + (existingZone.largeur || 0) ||
      zone.position_y + zone.largeur <= existingZone.position_y
    )

    if (overlap) {
      conflicts.push(`Chevauchement avec la zone "${existingZone.nom_zone}"`)
    }
  })

  return conflicts
}

export const getAvailableSpace = (magasinLongueur: number, magasinLargeur: number) => {
  return {
    maxX: magasinLongueur,
    maxY: magasinLargeur,
    suggestions: [
      { x: 0, y: 0, width: Math.min(20, magasinLongueur), height: Math.min(15, magasinLargeur) },
      { x: magasinLongueur - 20, y: 0, width: 20, height: Math.min(15, magasinLargeur) },
    ],
  }
}
