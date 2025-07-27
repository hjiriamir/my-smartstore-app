"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import jsPDF from "jspdf"
import { useToast } from "@/hooks/use-toast"
import type { Element, ElementType, FloorPlan, FloorPlan3DViewerRef } from "@/lib/typese"
import { saveFloorPlan, formatDimension, getElementLabel, getElementColor } from "@/lib/utilse"

export function useFloorPlanEditor() {
  const { toast } = useToast()

  const [elements, setElements] = useState<Element[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [currentTool, setCurrentTool] = useState<ElementType | null>(null)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [ghostElement, setGhostElement] = useState<Element | null>(null)
  const [unitSystem, setUnitSystem] = useState<"m" | "cm">("cm")
  const [showDimensions, setShowDimensions] = useState(true)
  const [planCenter, setPlanCenter] = useState({ x: 0, y: 0 })
  const [moveMode, setMoveMode] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [planName, setPlanName] = useState("")

  const canvasRef = useRef<HTMLDivElement>(null)
  const threeViewerRef = useRef<FloorPlan3DViewerRef>(null)

  // Get selected element data
  const selectedElementData = elements.find((el) => el.id === selectedElement) || null

  const canPlaceElement = useCallback(
    (type: ElementType, x: number, y: number, width: number, height: number): boolean => {
      // Pour les portes, vérifier si elles sont à côté d'un mur
      if (type === "door") {
        return elements.some((el) => {
          if (el.type === "wall") {
            // Vérifier si la porte est adjacente à un mur
            const doorLeft = x
            const doorRight = x + width
            const doorTop = y
            const doorBottom = y + height

            const wallLeft = el.x
            const wallRight = el.x + el.width
            const wallTop = el.y
            const wallBottom = el.y + el.height

            // Vérifier si la porte touche le mur
            const touchesHorizontally = Math.abs(doorRight - wallLeft) < 5 || Math.abs(doorLeft - wallRight) < 5
            const touchesVertically = Math.abs(doorBottom - wallTop) < 5 || Math.abs(doorTop - wallBottom) < 5

            const overlapsHorizontally = doorLeft < wallRight && doorRight > wallLeft
            const overlapsVertically = doorTop < wallBottom && doorBottom > wallTop

            return (touchesHorizontally && overlapsVertically) || (touchesVertically && overlapsHorizontally)
          }
          return false
        })
      }
      // Pour les fenêtres, vérifier si elles sont sur un mur
      if (type === "window") {
        const wallMatch = elements.find((el) => {
          if (el.type === "wall") {
            // Vérifier si la fenêtre est sur un mur
            const windowLeft = x
            const windowRight = x + width
            const windowTop = y
            const windowBottom = y + height

            const wallLeft = el.x
            const wallRight = el.x + el.width
            const wallTop = el.y
            const wallBottom = el.y + el.height

            // Vérifier si la fenêtre est à l'intérieur du mur
            const isInside =
              windowLeft >= wallLeft && windowRight <= wallRight && windowTop >= wallTop && windowBottom <= wallBottom
            if (isInside) {
              return true
            }
          }
          return false
        })
        return !!wallMatch
      }
      // Pour les autres types d'éléments, pas de restriction
      return true
    },
    [elements],
  )

  // Fonction pour sélectionner un outil (type d'élément)
  const selectTool = useCallback((type: ElementType) => {
    setCurrentTool(type)
    setSelectedElement(null) // Désélectionner tout élément lors du choix d'un outil
    setGhostElement(null) // Reset ghost element when selecting a new tool
  }, [])

  // Fonction pour calculer le centre du plan
  const calculatePlanCenter = useCallback(() => {
    if (elements.length === 0) return { x: 0, y: 0 }
    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    elements.forEach((element) => {
      minX = Math.min(minX, element.x)
      maxX = Math.max(maxX, element.x + element.width)
      minY = Math.min(minY, element.y)
      maxY = Math.max(maxY, element.y + element.height)
    })

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    }
  }, [elements])

  // Fonction pour centrer la vue sur le plan
  const centerView = useCallback(() => {
    if (elements.length === 0) return

    const center = calculatePlanCenter()
    setPlanCenter(center)

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setOffset({
        x: rect.width / 2 - center.x * zoom,
        y: rect.height / 2 - center.y * zoom,
      })
    }

    // Centrer la vue 3D
    if (viewMode === "3d" && threeViewerRef.current) {
      threeViewerRef.current.updateAllElements(elements) // Re-center 3D view
    }
  }, [elements, calculatePlanCenter, zoom, viewMode])

  // Fonction pour gérer le clic sur le canvas
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Si on est en mode déplacement, ne rien faire
      if (moveMode) return

      // Vérifier si on a cliqué directement sur le canvas (et non sur un élément)
      const isCanvasClick = e.target === canvasRef.current

      // Si on a cliqué sur le canvas (pas sur un élément) et qu'un élément est sélectionné, on le désélectionne
      if (isCanvasClick && selectedElement) {
        setSelectedElement(null)
        return
      }

      // Si on a un outil sélectionné, on place un nouvel élément
      if (currentTool && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        let x = (e.clientX - rect.left - offset.x) / zoom
        let y = (e.clientY - rect.top - offset.y) / zoom

        // Snap to grid si activé
        if (snapToGrid) {
          x = Math.round(x / gridSize) * gridSize
          y = Math.round(y / gridSize) * gridSize
        }

        // Dimensions par défaut selon le type d'élément
        let width = 100
        let height = 20
        let depth = 40

        if (currentTool === "wall") {
          width = 200
          height = 10
          depth = 100
        } else if (currentTool === "door") {
          width = 80
          height = 10
          depth = 10
        } else if (currentTool === "window") {
          width = 100
          height = 10
          depth = 10
        } else if (currentTool === "shelf" || currentTool === "display") {
          width = 120
          height = 40
          depth = 60
        } else if (currentTool === "rack") {
          width = 80
          height = 80
          depth = 40
        } else if (currentTool === "table") {
          width = 100
          height = 100
          depth = 30
        } else if (currentTool === "fridge") {
          width = 80
          height = 60
          depth = 80
        } else if (currentTool === "dairy_fridge") {
          width = 150
          height = 60
          depth = 100
        } else if (currentTool === "planogram") {
          width = 150
          height = 40
          depth = 80
        } else if (currentTool === "gondola") {
          width = 200
          height = 60
          depth = 100
        } else if (currentTool === "line") {
          width = 100
          height = 2
          depth = 2
        } else if (currentTool === "rectangle") {
          width = 80
          height = 60
          depth = 2
        } else if (currentTool === "circle") {
          width = 60
          height = 60
          depth = 2
        } else if (currentTool === "chair") {
          width = 40
          height = 40
          depth = 40
        } else if (currentTool === "sofa") {
          width = 120
          height = 60
          depth = 40
        } else if (currentTool === "bed") {
          width = 140
          height = 200
          depth = 40
        } else if (currentTool === "plant") {
          width = 40
          height = 40
          depth = 80
        } else if (currentTool === "counter") {
          width = 150
          height = 60
          depth = 40
        } else if (currentTool === "cashier") {
          width = 100
          height = 80
          depth = 60
        } else if (currentTool === "mannequin") {
          width = 40
          height = 40
          depth = 180
        } else if (currentTool === "cube") {
          width = 120
          height = 120
          depth = 120
        }

        if (currentTool === "door" || currentTool === "window") {
          if (!canPlaceElement(currentTool, x, y, width, height)) {
            // Afficher un message d'erreur ou une notification
            alert(
              currentTool === "door"
                ? "Les portes doivent être placées à côté d'un mur"
                : "Les fenêtres doivent être placées sur un mur",
            )
            return
          }
        }

        // Générer un nom par défaut basé sur le type et un compteur
        const elementsOfType = elements.filter((el) => el.type === currentTool).length + 1
        const defaultName = `${getElementLabel(currentTool)} ${elementsOfType}`

        const newElement: Element = {
          id: `element-${Date.now()}`,
          type: currentTool,
          x,
          y,
          width,
          height,
          depth,
          rotation: 0,
          name: defaultName, // Ajouter un nom par défaut
        }

        if (currentTool === "window") {
          // Find the wall this window is being placed on
          const parentWall = elements.find((el) => {
            if (el.type === "wall") {
              const windowLeft = x
              const windowRight = x + width
              const windowTop = y
              const windowBottom = y + height
              const wallLeft = el.x
              const wallRight = el.x + el.width
              const wallTop = el.y
              const wallBottom = el.y + el.height
              return (
                windowLeft >= wallLeft && windowRight <= wallRight && windowTop >= wallTop && windowBottom <= wallBottom
              )
            }
            return false
          })
          if (parentWall) {
            // Default distances - 20% from top and bottom
            const defaultDistance = Math.min(parentWall.depth * 0.2, 20)
            // Add window-specific properties
            newElement.parentWallId = parentWall.id
            newElement.windowTopDistance = defaultDistance
            newElement.windowBottomDistance = defaultDistance
          }
        }

        setElements((prevElements) => [...prevElements, newElement])
        setSelectedElement(newElement.id)
        setCurrentTool(null) // Désélectionner l'outil après placement
        setGhostElement(null)

        // Ajouter l'élément à la scène 3D si elle existe
        if (threeViewerRef.current) {
          threeViewerRef.current.add3DObject(newElement)
        }

        // Recalculer le centre du plan
        const newCenter = calculatePlanCenter()
        setPlanCenter(newCenter)
      }
    },
    [
      currentTool,
      moveMode,
      selectedElement,
      elements,
      canPlaceElement,
      offset,
      zoom,
      snapToGrid,
      gridSize,
      calculatePlanCenter,
    ],
  )

  // Fonction pour gérer le début du déplacement d'un élément
  const handleElementDragStart = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation()
      setSelectedElement(elementId)
      setIsDraggingElement(true)
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setDragStart({
          x: (e.clientX - rect.left - offset.x) / zoom,
          y: (e.clientY - rect.top - offset.y) / zoom,
        })
      }
    },
    [offset, zoom],
  )

  // Fonction pour gérer le déplacement du canvas
  const handleCanvasDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (currentTool || isResizing || isRotating) return
      // Si on est en mode déplacement ou si on clique directement sur le canvas
      if (moveMode || e.target === canvasRef.current) {
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    },
    [currentTool, isResizing, isRotating, moveMode],
  )

  // Fonction pour gérer le mouvement de la souris
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Afficher l'aperçu de l'élément à placer
      if (currentTool && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        let x = (e.clientX - rect.left - offset.x) / zoom
        let y = (e.clientY - rect.top - offset.y) / zoom

        // Snap to grid si activé
        if (snapToGrid) {
          x = Math.round(x / gridSize) * gridSize
          y = Math.round(y / gridSize) * gridSize
        }

        // Dimensions par défaut selon le type d'élément
        let width = 100
        let height = 20
        let depth = 40
        if (currentTool === "wall") {
          width = 200
          height = 10
          depth = 100
        } else if (currentTool === "door") {
          width = 80
          height = 10
          depth = 10
        } else if (currentTool === "window") {
          width = 100
          height = 10
          depth = 10
        } else if (currentTool === "shelf" || currentTool === "display") {
          width = 120
          height = 40
          depth = 60
        } else if (currentTool === "rack") {
          width = 80
          height = 80
          depth = 40
        } else if (currentTool === "table") {
          width = 100
          height = 100
          depth = 30
        } else if (currentTool === "fridge") {
          width = 80
          height = 60
          depth = 80
        } else if (currentTool === "dairy_fridge") {
          width = 150
          height = 60
          depth = 100
        } else if (currentTool === "cube") {
          width = 120
          height = 120
          depth = 120
        }

        // Vérifier si l'élément peut être placé à cet endroit
        const canPlace =
          currentTool === "door" || currentTool === "window" ? canPlaceElement(currentTool, x, y, width, height) : true
        setGhostElement({
          id: "ghost",
          type: currentTool,
          x,
          y,
          width,
          height,
          depth,
          rotation: 0,
          valid: canPlace, // Ajouter cette propriété pour indiquer si le placement est valide
        })
      }

      // Déplacer le canvas
      if (isDragging) {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        setOffset({
          x: offset.x + dx,
          y: offset.y + dy,
        })
        setDragStart({ x: e.clientX, y: e.clientY })
      }
      // Déplacer un élément
      else if (isDraggingElement && selectedElement) {
        const element = elements.find((el) => el.id === selectedElement)
        if (element && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect()
          const x = (e.clientX - rect.left - offset.x) / zoom
          const y = (e.clientY - rect.top - offset.y) / zoom
          const dx = x - dragStart.x
          const dy = y - dragStart.y

          let newX = element.x + dx
          let newY = element.y + dy

          // Snap to grid si activé
          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize
            newY = Math.round(newY / gridSize) * gridSize
          }

          setElements((prevElements) =>
            prevElements.map((el) => (el.id === selectedElement ? { ...el, x: newX, y: newY } : el)),
          )
          // Mettre à jour la position 3D
          if (threeViewerRef.current) {
            threeViewerRef.current.update3DObjectPosition(selectedElement)
          }
          setDragStart({ x, y })
          // Recalculer le centre du plan
          const newCenter = calculatePlanCenter()
          setPlanCenter(newCenter)
        }
      }
      // Redimensionner un élément
      else if (isResizing && selectedElement && resizeDirection) {
        const element = elements.find((el) => el.id === selectedElement)
        if (element && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect()
          const x = (e.clientX - rect.left - offset.x) / zoom
          const y = (e.clientY - rect.top - offset.y) / zoom
          const dx = x - dragStart.x
          const dy = y - dragStart.y

          let newWidth = element.width
          let newHeight = element.height
          let newX = element.x
          let newY = element.y

          if (resizeDirection.includes("right")) {
            newWidth = element.width + dx
            if (snapToGrid) {
              newWidth = Math.round(newWidth / gridSize) * gridSize
            }
          } else if (resizeDirection.includes("left")) {
            newWidth = element.width - dx
            if (newWidth > 10) {
              newX = element.x + dx
              if (snapToGrid) {
                newX = Math.round(newX / gridSize) * gridSize
                newWidth = element.width + element.x - newX
              }
            }
          }
          if (resizeDirection.includes("bottom")) {
            newHeight = element.height + dy
            if (snapToGrid) {
              newHeight = Math.round(newHeight / gridSize) * gridSize
            }
          } else if (resizeDirection.includes("top")) {
            newHeight = element.height - dy
            if (newHeight > 10) {
              newY = element.y + dy
              if (snapToGrid) {
                newY = Math.round(newY / gridSize) * gridSize
                newHeight = element.height + element.y - newY
              }
            }
          }

          setElements((prevElements) =>
            prevElements.map((el) =>
              el.id === selectedElement
                ? {
                    ...el,
                    x: newX,
                    y: newY,
                    width: Math.max(10, newWidth),
                    height: Math.max(10, newHeight),
                  }
                : el,
            ),
          )
          // Mettre à jour la taille 3D
          if (threeViewerRef.current) {
            threeViewerRef.current.update3DObjectSize(selectedElement)
          }
          setDragStart({ x, y })
          // Recalculer le centre du plan
          const newCenter = calculatePlanCenter()
          setPlanCenter(newCenter)
        }
      }
      // Faire pivoter un élément
      else if (isRotating && selectedElement) {
        const element = elements.find((el) => el.id === selectedElement)
        if (element && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect()
          const centerX = (element.x + element.width / 2) * zoom + offset.x
          const centerY = (element.y + element.height / 2) * zoom + offset.y

          // Calculer l'angle entre le centre de l'élément et la position de la souris
          const angle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX) * (180 / Math.PI)

          // Snap à des angles de 15 degrés si snapToGrid est activé
          let newRotation = angle
          if (snapToGrid) {
            newRotation = Math.round(angle / 15) * 15
          }

          setElements((prevElements) =>
            prevElements.map((el) => (el.id === selectedElement ? { ...el, rotation: newRotation } : el)),
          )
          // Mettre à jour la rotation 3D
          if (threeViewerRef.current) {
            threeViewerRef.current.update3DObjectRotation(selectedElement)
          }
        }
      }
    },
    [
      currentTool,
      offset,
      zoom,
      snapToGrid,
      gridSize,
      canPlaceElement,
      isDragging,
      dragStart,
      isDraggingElement,
      selectedElement,
      elements,
      calculatePlanCenter,
      isResizing,
      resizeDirection,
      isRotating,
    ],
  )

  // Fonction pour gérer la fin du déplacement
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsDraggingElement(false)
    setIsResizing(false)
    setIsRotating(false)
    setResizeDirection(null)
  }, [])

  // Fonction pour commencer le redimensionnement
  const startResize = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation()
      setIsResizing(true)
      setResizeDirection(direction)
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setDragStart({
          x: (e.clientX - rect.left - offset.x) / zoom,
          y: (e.clientY - rect.top - offset.y) / zoom,
        })
      }
    },
    [offset, zoom],
  )

  // Fonction pour commencer la rotation
  const startRotate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRotating(true)
  }, [])

  // Fonction pour zoomer
  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      if (direction === "in") {
        setZoom(Math.min(zoom + 0.1, 3))
      } else {
        setZoom(Math.max(zoom - 0.1, 0.5))
      }
    },
    [zoom],
  )

  // Fonction pour modifier la profondeur d'un élément
  const updateElementDepth = useCallback(
    (depth: number) => {
      if (selectedElement) {
        setElements((prevElements) => prevElements.map((el) => (el.id === selectedElement ? { ...el, depth } : el)))
        // Mettre à jour la taille 3D
        if (threeViewerRef.current) {
          threeViewerRef.current.update3DObjectSize(selectedElement)
        }
      }
    },
    [selectedElement],
  )

  // Effet pour gérer les événements de souris globaux
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        setOffset({
          x: offset.x + dx,
          y: offset.y + dy,
        })
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setIsDraggingElement(false)
      setIsResizing(false)
      setIsRotating(false)
      setResizeDirection(null)
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, dragStart, offset])

  // Effet pour mettre à jour les objets 3D lorsque les éléments changent
  useEffect(() => {
    if (viewMode === "3d" && threeViewerRef.current) {
      threeViewerRef.current.updateAllElements(elements)
    }
  }, [elements, viewMode])

  // Fonction pour exporter le plan en JSON
  const exportToJSON = useCallback(() => {
    const dataStr = JSON.stringify(elements, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `floor-plan-${new Date().toISOString().slice(0, 10)}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }, [elements])

  // Fonction pour importer un plan depuis un fichier JSON
  const importFromJSON = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedElements = JSON.parse(event.target?.result as string) as Element[]
          setElements(importedElements)
          // Recréer les objets 3D si nécessaire
          if (viewMode === "3d" && threeViewerRef.current) {
            threeViewerRef.current.updateAllElements(importedElements)
          }
          // Centrer la vue sur le nouveau plan
          centerView()
          // Réinitialiser l'input file pour permettre de réimporter le même fichier
          e.target.value = ""
        } catch (error) {
          console.error("Erreur lors de l'importation du fichier JSON:", error)
          alert("Le fichier sélectionné n'est pas un fichier JSON valide pour un plan d'étage.")
        }
      }
      reader.readAsText(file)
    },
    [viewMode, centerView],
  )

  // Fonction pour exporter le plan en image
  const exportToImage = useCallback(() => {
    if (viewMode === "2d" && canvasRef.current) {
      // Créer un canvas temporaire pour l'export
      const tempCanvas = document.createElement("canvas")
      const ctx = tempCanvas.getContext("2d")
      if (!ctx) return

      // Calculer les dimensions du plan
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      elements.forEach((element) => {
        minX = Math.min(minX, element.x)
        maxX = Math.max(maxX, element.x + element.width)
        minY = Math.min(minY, element.y)
        maxY = Math.max(maxY, element.y + element.height)
      })

      // Ajouter une marge
      const margin = 50
      minX -= margin
      minY -= margin
      maxX += margin
      maxY += margin

      const width = maxX - minX
      const height = maxY - minY
      tempCanvas.width = width
      tempCanvas.height = height

      // Dessiner la grille
      ctx.fillStyle = "#f8f8f8"
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = "#ddd"
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Dessiner les éléments
      elements.forEach((element) => {
        ctx.save()
        // Translater au centre de l'élément pour la rotation
        ctx.translate(element.x - minX + element.width / 2, element.y - minY + element.height / 2)
        ctx.rotate((element.rotation * Math.PI) / 180)

        // Dessiner l'élément
        ctx.fillStyle = getElementColor(element.type)
        ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height)
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
        ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height)

        // Ajouter le libellé
        ctx.fillStyle = "#fff"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(getElementLabel(element.type), 0, 0)

        // Ajouter les dimensions
        ctx.fillStyle = "#000"
        ctx.font = "8px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(
          `${formatDimension(element.width, unitSystem)} × ${formatDimension(
            element.height,
            unitSystem,
          )} × ${formatDimension(element.depth, unitSystem)}`,
          0,
          element.height / 2 + 5,
        )
        ctx.restore()
      })

      // Exporter l'image
      const dataUrl = tempCanvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `floor-plan-2d-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    } else if (viewMode === "3d" && threeViewerRef.current) {
      // Pour la vue 3D, on capture directement le rendu
      threeViewerRef.current.renderScene()
      const canvas = threeViewerRef.current.getDomElement()
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `floor-plan-3d-${new Date().toISOString().slice(0, 10)}.png`
        link.href = dataUrl
        link.click()
      }
    }
  }, [elements, viewMode, gridSize, unitSystem])

  // Fonction pour exporter le plan en PDF
  const exportToPDF = useCallback(() => {
    if (viewMode === "2d" && canvasRef.current) {
      // Créer un canvas temporaire pour l'export
      const tempCanvas = document.createElement("canvas")
      const ctx = tempCanvas.getContext("2d")
      if (!ctx) return

      // Calculer les dimensions du plan
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      elements.forEach((element) => {
        minX = Math.min(minX, element.x)
        maxX = Math.max(maxX, element.x + element.width)
        minY = Math.min(minY, element.y)
        maxY = Math.max(maxY, element.y + element.height)
      })

      // Ajouter une marge
      const margin = 50
      minX -= margin
      minY -= margin
      maxX += margin
      maxY += margin

      const width = maxX - minX
      const height = maxY - minY
      tempCanvas.width = width
      tempCanvas.height = height

      // Dessiner la grille
      ctx.fillStyle = "#f8f8f8"
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = "#ddd"
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Dessiner les éléments
      elements.forEach((element) => {
        ctx.save()
        // Translater au centre de l'élément pour la rotation
        ctx.translate(element.x - minX + element.width / 2, element.y - minY + element.height / 2)
        ctx.rotate((element.rotation * Math.PI) / 180)

        // Dessiner l'élément
        ctx.fillStyle = getElementColor(element.type)
        ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height)
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
        ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height)

        // Ajouter le libellé
        ctx.fillStyle = "#fff"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(getElementLabel(element.type), 0, 0)

        // Ajouter les dimensions
        ctx.fillStyle = "#000"
        ctx.font = "8px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(
          `${formatDimension(element.width, unitSystem)} × ${formatDimension(
            element.height,
            unitSystem,
          )} × ${formatDimension(element.depth, unitSystem)}`,
          0,
          element.height / 2 + 5,
        )
        ctx.restore()
      })

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      })
      // Ajouter l'image au PDF
      const imgData = tempCanvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, width, height)

      // Ajouter un titre et des informations
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Plan d'étage", 20, 20)
      pdf.setFontSize(10)
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35)
      pdf.text(`Nombre d'éléments: ${elements.length}`, 20, 45)

      // Ajouter une légende avec les dimensions de chaque élément
      pdf.setFontSize(12)
      pdf.text("Légende des éléments:", 20, 60)
      let yPos = 75
      elements.forEach((element, index) => {
        if (index < 15) {
          // Limiter le nombre d'éléments dans la légende pour éviter de surcharger le PDF
          pdf.setFontSize(8)
          pdf.text(
            `${getElementLabel(element.type)}: ${formatDimension(element.width, unitSystem)} × ${formatDimension(
              element.height,
              unitSystem,
            )} × ${formatDimension(element.depth, unitSystem)}`,
            20,
            yPos,
          )
          yPos += 10
        }
      })

      // Télécharger le PDF
      pdf.save(`floor-plan-${new Date().toISOString().slice(0, 10)}.pdf`)
    } else if (viewMode === "3d" && threeViewerRef.current) {
      // Pour la vue 3D, on capture d'abord une image
      threeViewerRef.current.renderScene()
      const canvas = threeViewerRef.current.getDomElement()
      if (canvas) {
        const imgData = canvas.toDataURL("image/png")
        // Obtenir les dimensions du conteneur
        const width = canvas.width
        const height = canvas.height

        // Créer le PDF
        const pdf = new jsPDF({
          orientation: width > height ? "landscape" : "portrait",
          unit: "px",
          format: [width, height],
        })
        // Ajouter l'image au PDF
        pdf.addImage(imgData, "PNG", 0, 0, width, height)

        // Ajouter un titre et des informations
        pdf.setFontSize(16)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Plan d'étage 3D", 20, 20)
        pdf.setFontSize(10)
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35)
        pdf.text(`Nombre d'éléments: ${elements.length}`, 20, 45)

        // Ajouter une légende avec les dimensions de chaque élément
        pdf.setFontSize(12)
        pdf.text("Légende des éléments:", 20, 60)
        let yPos = 75
        elements.forEach((element, index) => {
          if (index < 15) {
            // Limiter le nombre d'éléments dans la légende pour éviter de surcharger le PDF
            pdf.setFontSize(8)
            pdf.text(
              `${getElementLabel(element.type)}: ${formatDimension(element.width, unitSystem)} × ${formatDimension(
                element.height,
                unitSystem,
              )} × ${formatDimension(element.depth, unitSystem)}`,
              20,
              yPos,
            )
            yPos += 10
          }
        })

        // Télécharger le PDF
        pdf.save(`floor-plan-3d-${new Date().toISOString().slice(0, 10)}.pdf`)
      }
    }
  }, [elements, viewMode, gridSize, unitSystem])

  // Function to handle saving the floor plan
  const handleSaveFloorPlan = useCallback(() => {
    if (!planName.trim()) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Veuillez entrer un nom pour votre plan d'étage.",
        variant: "destructive",
      })
      return
    }
    try {
      // Create floor plan object
      const floorPlan: FloorPlan = {
        id: `plan-${Date.now()}`,
        name: planName,
        elements: elements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      // Save to storage
      saveFloorPlan(floorPlan)
      toast({
        title: "Plan d'étage sauvegardé",
        description: "Votre plan d'étage a été sauvegardé avec succès.",
      })
      // Close dialog
      setShowSaveDialog(false)
      setPlanName("")
    } catch (error) {
      console.error("Error saving floor plan:", error)
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur est survenue lors de la sauvegarde du plan d'étage.",
        variant: "destructive",
      })
    }
  }, [elements, planName, toast])

  // Fonction pour supprimer l'élément sélectionné
  const deleteSelectedElement = useCallback(() => {
    if (selectedElement) {
      // Supprimer l'objet 3D s'il existe
      if (threeViewerRef.current) {
        threeViewerRef.current.remove3DObject(selectedElement)
      }
      // Supprimer l'élément de la liste
      setElements((prevElements) => prevElements.filter((el) => el.id !== selectedElement))
      setSelectedElement(null)
      toast({
        title: "Élément supprimé",
        description: "L'élément a été supprimé avec succès.",
      })
    }
  }, [selectedElement, toast])

  // Effet pour gérer les événements clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Annuler la sélection d'un outil avec Échap
      if (e.key === "Escape") {
        setCurrentTool(null)
        setSelectedElement(null)
        setGhostElement(null)
      }
      // Supprimer l'élément sélectionné avec la touche Delete
      if (e.key === "Delete" && selectedElement) {
        deleteSelectedElement()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedElement, currentTool, deleteSelectedElement])

  return {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    currentTool,
    setCurrentTool,
    viewMode,
    setViewMode,
    zoom,
    setZoom,
    isDragging,
    setIsDragging,
    isDraggingElement,
    setIsDraggingElement,
    isResizing,
    setIsResizing,
    resizeDirection,
    setResizeDirection,
    isRotating,
    setIsRotating,
    dragStart,
    setDragStart,
    offset,
    setOffset,
    snapToGrid,
    setSnapToGrid,
    gridSize,
    setGridSize,
    ghostElement,
    setGhostElement,
    unitSystem,
    setUnitSystem,
    showDimensions,
    setShowDimensions,
    planCenter,
    setPlanCenter,
    moveMode,
    setMoveMode,
    sidebarVisible,
    setSidebarVisible,
    showSaveDialog,
    setShowSaveDialog,
    planName,
    setPlanName,
    canvasRef,
    threeViewerRef,
    selectedElementData,
    selectTool,
    canPlaceElement,
    calculatePlanCenter,
    centerView,
    handleCanvasClick,
    handleElementDragStart,
    handleCanvasDragStart,
    handleMouseMove,
    handleMouseUp,
    startResize,
    startRotate,
    handleZoom,
    updateElementDepth,
    deleteSelectedElement,
    exportToJSON,
    importFromJSON,
    exportToImage,
    exportToPDF,
    handleSaveFloorPlan,
  }
}
