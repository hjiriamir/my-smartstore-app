"use client"

import type React from "react"
import { Store, AlertTriangle, ChevronUp, ChevronDown, Eye, EyeOff, LayoutDashboard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMagasinData } from "../../../../hooks/useMagasinData"
import { MagasinService } from "@/src/services/magasin-service"
import { checkZoneConflicts, generateZoneId } from "../../../../utils/magasin-utils"

import { MagasinSelector } from "./MagasinSelector"
import { MagasinDetailsComponent } from "./MagasinDetails"
import { Plan2D } from "./Plan2D"
import { AddZoneForm } from "./AddZoneForm"
import { ZonesList } from "./ZonesList"

import type { Structure } from "../../../../types/magasin-types"

export default function CarteMagasinsZones() {
    const [showMagasinDetails, setShowMagasinDetails] = useState(true)
    const [showZonesList, setShowZonesList] = useState(true)
  
    const {
      user,
      entrepriseStats,
      magasinSelectionne,
      loading,
      loadingDetails,
      error,
      authError,
      showAddZoneForm,
      newZone,
      conflictZones,
      zoneToDelete,
      isCreatingZone,
      isDeletingZone,
      structures,
      showAddStructure,
      placementMode,
      previewStructure,
      newStructure,
      setMagasinSelectionne,
      setShowAddZoneForm,
      setNewZone,
      setConflictZones,
      setZoneToDelete,
      setIsCreatingZone,
      setIsDeletingZone,
      setStructures,
      setShowAddStructure,
      setPlacementMode,
      setPreviewStructure,
      setNewStructure,
      fetchMagasinDetails,
      handleRetry,
    } = useMagasinData()
  
    const handleMagasinChange = (magasinId: string) => {
      if (magasinId) {
        fetchMagasinDetails(magasinId)
      } else {
        setMagasinSelectionne(null)
      }
      setShowAddZoneForm(false)
      setConflictZones([])
      setZoneToDelete(null)
      setStructures([])
    }
  
    const handleZoneInputChange = (field: string, value: any) => {
      setNewZone((prev) => ({ ...prev, [field]: value }))
      if (field === "longueur" || field === "largeur" || field === "position_x" || field === "position_y") {
        const updatedZone = { ...newZone, [field]: value }
        if (magasinSelectionne) {
          const conflicts = checkZoneConflicts(
            updatedZone,
            magasinSelectionne.zones,
            Number.parseInt(magasinSelectionne.longueur),
            Number.parseInt(magasinSelectionne.largeur),
          )
          setConflictZones(conflicts)
        }
      }
    }
  
    const handleCreateZone = async () => {
      if (!magasinSelectionne || !newZone.nom.trim()) return
  
      setIsCreatingZone(true)
      try {
        const zoneData = {
          zone_id: newZone.zone_id,
          nom_zone: newZone.nom,
          magasin_id: magasinSelectionne.magasin_id,
          description: newZone.description,
          emplacement: newZone.emplacement,
          longueur: newZone.longueur,
          largeur: newZone.largeur,
          hauteur: newZone.hauteur,
          temperature: newZone.temperature,
          eclairage: newZone.eclairage,
          position_x: newZone.position_x,
          position_y: newZone.position_y,
          orientation: newZone.orientation,
        }
  
        await MagasinService.createZone(zoneData)
        await fetchMagasinDetails(magasinSelectionne.magasin_id)
  
        // Reset form
        setShowAddZoneForm(false)
        const generatedId = generateZoneId(magasinSelectionne.zones)
        setNewZone({
          zone_id: generatedId,
          nom: "",
          couleur: "#3B82F6",
          description: "",
          emplacement: "",
          longueur: 0,
          largeur: 0,
          hauteur: 0,
          temperature: 20,
          eclairage: "LED",
          position_x: 0,
          position_y: 0,
          orientation: "Nord",
        })
        setConflictZones([])
      } catch (error) {
        console.error("Error creating zone:", error)
      } finally {
        setIsCreatingZone(false)
      }
    }
  
    const handleDeleteZone = async (zoneId: number) => {
      setIsDeletingZone(true)
      try {
        await MagasinService.deleteZone(zoneId)
        if (magasinSelectionne) {
          await fetchMagasinDetails(magasinSelectionne.magasin_id)
        }
        setZoneToDelete(null)
      } catch (error) {
        console.error("Error deleting zone:", error)
      } finally {
        setIsDeletingZone(false)
      }
    }
  
    const handleStartPlacement = () => {
      if (!magasinSelectionne) return
      setPlacementMode(true)
      setShowAddStructure(false)
    }
  
    const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placementMode || !magasinSelectionne) return
  
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
  
      const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
      const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)
  
      const position_x = (x / rect.width) * magasinLongueur
      const position_y = (y / rect.height) * magasinLargeur
  
      const newStructureObj: Structure = {
        id: `struct_${Date.now()}`,
        type: newStructure.type,
        position_x: Math.max(0, Math.min(magasinLongueur - newStructure.width, position_x)),
        position_y: Math.max(0, Math.min(magasinLargeur - newStructure.height, position_y)),
        width: newStructure.width,
        height: newStructure.height,
        orientation: newStructure.orientation,
      }
  
      setStructures((prev) => [...prev, newStructureObj])
      setPlacementMode(false)
      setPreviewStructure(null)
    }
  
    const handlePlanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!placementMode || !magasinSelectionne) return
  
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
  
      const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
      const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)
  
      const position_x = (x / rect.width) * magasinLongueur
      const position_y = (y / rect.height) * magasinLargeur
  
      setPreviewStructure({
        id: "preview",
        type: newStructure.type,
        position_x: Math.max(0, Math.min(magasinLongueur - newStructure.width, position_x)),
        position_y: Math.max(0, Math.min(magasinLargeur - newStructure.height, position_y)),
        width: newStructure.width,
        height: newStructure.height,
        orientation: newStructure.orientation,
      })
    }
  
    const handleRemoveStructure = (structureId: string) => {
      setStructures((prev) => prev.filter((s) => s.id !== structureId))
    }
  
    const handleCancelPlacement = () => {
      setPlacementMode(false)
      setPreviewStructure(null)
    }
  
    const applySuggestion = (suggestion: any) => {
      setNewZone((prev) => ({
        ...prev,
        position_x: suggestion.x,
        position_y: suggestion.y,
        longueur: suggestion.width,
        largeur: suggestion.height,
      }))
    }
  
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Chargement des données...</p>
          </div>
        </div>
      )
    }
  
    if (authError || error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-8">
          <Card className="border-red-200 bg-red-50 max-w-md w-full shadow-lg">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {authError ? "Authentification requise" : "Erreur"}
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              {authError ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Pour utiliser cette fonctionnalité, vous devez :</p>
                  <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
                    <li>Vous connecter à votre compte</li>
                    <li>Avoir un token d'authentification valide</li>
                    <li>Configurer la variable d'environnement NEXT_PUBLIC_API_BASE_URL</li>
                  </ul>
                </div>
              ) : (
                <Button onClick={handleRetry} variant="outline">
                  Réessayer
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }
  
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3 sm:p-4 shadow-lg">
                <Store className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Carte des Magasins et Zones</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Gérez et visualisez les zones de vos magasins avec précision. Sélectionnez un magasin pour commencer.
            </p>
  
            <div className="mt-4 sm:mt-6">
              <Button
                onClick={() => (window.location.href = "/Dashboard")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-sm sm:text-base">Accéder au Dashboard</span>
              </Button>
            </div>
          </div>
  
          <MagasinSelector
            entrepriseStats={entrepriseStats}
            magasinSelectionne={magasinSelectionne}
            onMagasinChange={handleMagasinChange}
            onClearSelection={() => setMagasinSelectionne(null)}
          />
  
          {magasinSelectionne && (
            <>
              <div className="space-y-4 sm:space-y-6">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Détails du Magasin
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMagasinDetails(!showMagasinDetails)}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      {showMagasinDetails ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span className="hidden sm:inline">Masquer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Afficher</span>
                        </>
                      )}
                      {showMagasinDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      showMagasinDetails ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="max-w-full">
                      <MagasinDetailsComponent
                        magasin={magasinSelectionne}
                        loadingDetails={loadingDetails}
                        showAddZoneForm={showAddZoneForm}
                        onToggleAddZoneForm={() => setShowAddZoneForm(!showAddZoneForm)}
                      />
                    </div>
                  </div>
                </div>
  
                <div className="w-full">
                  <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-4 lg:p-6">
                    <Plan2D
                      magasin={magasinSelectionne}
                      structures={structures}
                      showAddStructure={showAddStructure}
                      placementMode={placementMode}
                      previewStructure={previewStructure}
                      newStructure={newStructure}
                      showAddZoneForm={showAddZoneForm}
                      newZone={newZone}
                      conflictZones={conflictZones}
                      onToggleAddStructure={() => setShowAddStructure(!showAddStructure)}
                      onStartPlacement={handleStartPlacement}
                      onCancelPlacement={handleCancelPlacement}
                      onPlanClick={handlePlanClick}
                      onPlanMouseMove={handlePlanMouseMove}
                      onRemoveStructure={handleRemoveStructure}
                      onApplySuggestion={applySuggestion}
                    />
                  </div>
                </div>
              </div>
  
              {showAddZoneForm && (
                <div className="w-full max-w-4xl mx-auto">
                  <AddZoneForm
                    newZone={newZone}
                    magasin={magasinSelectionne}
                    conflictZones={conflictZones}
                    isCreatingZone={isCreatingZone}
                    onZoneInputChange={handleZoneInputChange}
                    onCreateZone={handleCreateZone}
                    onCancel={() => setShowAddZoneForm(false)}
                  />
                </div>
              )}
  
              {magasinSelectionne.zones.length > 0 && (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <div className="h-5 w-5 bg-purple-500 rounded"></div>
                      Détails des Zones ({magasinSelectionne.zones.length})
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowZonesList(!showZonesList)}
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      {showZonesList ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span className="hidden sm:inline">Masquer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Afficher</span>
                        </>
                      )}
                      {showZonesList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      showZonesList ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ZonesList
                      zones={magasinSelectionne.zones}
                      zoneToDelete={zoneToDelete}
                      isDeletingZone={isDeletingZone}
                      onDeleteZone={handleDeleteZone}
                      onSetZoneToDelete={setZoneToDelete}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
