"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertTriangle, CheckCircle } from "lucide-react"
import { orientations, eclairageOptions } from "@/types/magasin-constants"
import { getAvailableSpace } from "@/utils/magasin-utils"
import type { NewZone, MagasinDetails } from "@/types/magasin-types"

interface AddZoneFormProps {
    newZone: NewZone
    magasin: MagasinDetails
    conflictZones: string[]
    isCreatingZone: boolean
    onZoneInputChange: (field: string, value: any) => void
    onCreateZone: () => void
    onCancel: () => void
  }
  
  export function AddZoneForm({
    newZone,
    magasin,
    conflictZones,
    isCreatingZone,
    onZoneInputChange,
    onCreateZone,
    onCancel,
  }: AddZoneFormProps) {
    const { maxX, maxY, suggestions } = getAvailableSpace(
      Number.parseInt(magasin.longueur),
      Number.parseInt(magasin.largeur),
    )
  
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <div className="bg-white/20 rounded-full p-1.5 sm:p-2">
              <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <span className="text-sm sm:text-xl">Ajouter une nouvelle zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {conflictZones.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                <span className="font-medium text-red-600 text-sm sm:text-base">Conflits détectés :</span>
              </div>
              <ul className="text-xs sm:text-sm text-red-700 space-y-1">
                {conflictZones.map((conflict, index) => (
                  <li key={index}>• {conflict}</li>
                ))}
              </ul>
            </div>
          )}
  
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <span className="font-medium text-green-600 text-sm sm:text-base">Espace disponible :</span>
            </div>
            <div className="text-xs sm:text-sm text-green-700 space-y-1">
              <p>
                • Dimensions maximales : {maxX}m × {maxY}m
              </p>
              <p>
                • {suggestions.length} emplacement{suggestions.length > 1 ? "s" : ""} suggéré
                {suggestions.length > 1 ? "s" : ""} (zones vertes sur la carte)
              </p>
              {suggestions.length > 0 && <p>• Cliquez sur une zone verte pour l'utiliser automatiquement</p>}
            </div>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="zone_id" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                  ID Zone *<span className="text-xs text-muted-foreground">(généré automatiquement)</span>
                </Label>
                <Input
                  id="zone_id"
                  value={newZone.zone_id}
                  onChange={(e) => onZoneInputChange("zone_id", e.target.value)}
                  placeholder="Z001"
                  className="bg-gray-50 text-sm h-9 sm:h-10"
                />
              </div>
              <div>
                <Label htmlFor="nom" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                  Nom de la zone *<span className="text-xs text-muted-foreground">(ex: Rayon Électronique)</span>
                </Label>
                <Input
                  id="nom"
                  value={newZone.nom}
                  onChange={(e) => onZoneInputChange("nom", e.target.value)}
                  placeholder="Ex: Zone Électronique"
                  className="text-sm h-9 sm:h-10"
                />
              </div>
              <div>
                <Label htmlFor="couleur" className="text-sm">
                  Couleur d'affichage
                </Label>
                <Input
                  id="couleur"
                  type="color"
                  value={newZone.couleur}
                  onChange={(e) => onZoneInputChange("couleur", e.target.value)}
                  className="h-9 sm:h-10 w-full sm:w-20"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm">
                  Description (optionnelle)
                </Label>
                <Textarea
                  id="description"
                  value={newZone.description}
                  onChange={(e) => onZoneInputChange("description", e.target.value)}
                  placeholder="Description de la zone..."
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </div>
  
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor="longueur" className="text-xs sm:text-sm">
                    Longueur (m) *
                  </Label>
                  <Input
                    id="longueur"
                    type="number"
                    min="0"
                    max={Number.parseInt(magasin.longueur)}
                    value={newZone.longueur}
                    onChange={(e) => onZoneInputChange("longueur", Number(e.target.value))}
                    placeholder="0"
                    className="text-sm h-8 sm:h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="largeur" className="text-xs sm:text-sm">
                    Largeur (m) *
                  </Label>
                  <Input
                    id="largeur"
                    type="number"
                    min="0"
                    max={Number.parseInt(magasin.largeur)}
                    value={newZone.largeur}
                    onChange={(e) => onZoneInputChange("largeur", Number(e.target.value))}
                    placeholder="0"
                    className="text-sm h-8 sm:h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="hauteur" className="text-xs sm:text-sm">
                    Hauteur (m)
                  </Label>
                  <Input
                    id="hauteur"
                    type="number"
                    min="0"
                    step="0.1"
                    value={newZone.hauteur}
                    onChange={(e) => onZoneInputChange("hauteur", Number(e.target.value))}
                    placeholder="2.5"
                    className="text-sm h-8 sm:h-9"
                  />
                </div>
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor="position_x" className="text-xs sm:text-sm">
                    Position X (m)
                  </Label>
                  <Input
                    id="position_x"
                    type="number"
                    min="0"
                    max={Number.parseInt(magasin.longueur)}
                    value={newZone.position_x}
                    onChange={(e) => onZoneInputChange("position_x", Number(e.target.value))}
                    placeholder="0"
                    className="text-sm h-8 sm:h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="position_y" className="text-xs sm:text-sm">
                    Position Y (m)
                  </Label>
                  <Input
                    id="position_y"
                    type="number"
                    min="0"
                    max={Number.parseInt(magasin.largeur)}
                    value={newZone.position_y}
                    onChange={(e) => onZoneInputChange("position_y", Number(e.target.value))}
                    placeholder="0"
                    className="text-sm h-8 sm:h-9"
                  />
                </div>
              </div>
  
              <div>
                <Label htmlFor="temperature" className="text-sm">
                  Température (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={newZone.temperature}
                  onChange={(e) => onZoneInputChange("temperature", Number(e.target.value))}
                  placeholder="20.0"
                  className="text-sm h-9 sm:h-10"
                />
              </div>
  
              <div>
                <Label htmlFor="eclairage" className="text-sm">
                  Éclairage
                </Label>
                <Select value={newZone.eclairage} onValueChange={(value) => onZoneInputChange("eclairage", value)}>
                  <SelectTrigger className="text-sm h-9 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eclairageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
  
              <div>
                <Label htmlFor="orientation" className="text-sm">
                  Orientation
                </Label>
                <Select value={newZone.orientation} onValueChange={(value) => onZoneInputChange("orientation", value)}>
                  <SelectTrigger className="text-sm h-9 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orientations.map((orientation) => (
                      <SelectItem key={orientation.value} value={orientation.value} className="text-sm">
                        {orientation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
  
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-3 sm:pt-4 border-t">
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto text-sm h-9 sm:h-10 bg-transparent">
              Annuler
            </Button>
            <Button
              onClick={onCreateZone}
              disabled={
                !newZone.nom.trim() ||
                !newZone.zone_id.trim() ||
                conflictZones.length > 0 ||
                newZone.longueur <= 0 ||
                newZone.largeur <= 0 ||
                isCreatingZone
              }
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm h-9 sm:h-10"
            >
              {isCreatingZone ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              )}
              {isCreatingZone ? "Création..." : "Ajouter la zone"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
