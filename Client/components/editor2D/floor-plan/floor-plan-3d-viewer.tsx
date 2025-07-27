"use client"

import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Element, FloorPlan3DViewerRef } from "@/lib/typese"

interface FloorPlan3DViewerProps {
  elements: Element[]
  calculatePlanCenter: () => { x: number; y: number }
}

export const FloorPlan3DViewer = forwardRef<FloorPlan3DViewerRef, FloorPlan3DViewerProps>(
  ({ elements, calculatePlanCenter }, ref) => {
    const threeContainerRef = useRef<HTMLDivElement>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const controlsRef = useRef<OrbitControls | null>(null)
    const objectsRef = useRef<Map<string, THREE.Mesh | THREE.Group>>(new Map())

    // Function to add a 3D object to the scene
    const add3DObject = useCallback(
      (element: Element) => {
        if (!sceneRef.current) return

        let geometry: THREE.BufferGeometry
        let material: THREE.Material
        let color = 0xcccccc
        let object: THREE.Mesh | THREE.Group

        switch (element.type) {
          case "wall":
            geometry = new THREE.BoxGeometry(element.width, element.depth, element.height)
            color = 0xcccccc // Light gray for walls
            material = new THREE.MeshStandardMaterial({
              color,
              roughness: 0.7,
              metalness: 0.3,
            })
            object = new THREE.Mesh(geometry, material)
            // Positionner le mur sur le sol (y = 0) et ajuster la hauteur
            object.position.set(element.x + element.width / 2, element.depth / 2, element.y + element.height / 2)
            break
          case "door":
            // Créer une porte plus réaliste
            const doorGroup = new THREE.Group()
            // Cadre de porte
            const frameGeometry = new THREE.BoxGeometry(element.width + 10, element.depth, element.height + 10)
            const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 })
            const frame = new THREE.Mesh(frameGeometry, frameMaterial)
            doorGroup.add(frame)
            // Porte elle-même (légèrement ouverte pour mieux visualiser)
            const doorGeometry = new THREE.BoxGeometry(element.width - 10, element.depth / 2, element.height - 10)
            const doorMaterial = new THREE.MeshStandardMaterial({
              color: 0x8d6e63,
              roughness: 0.5,
              metalness: 0.1,
            })
            const doorPanel = new THREE.Mesh(doorGeometry, doorMaterial)
            doorPanel.position.set(5, element.depth / 4, 5)
            // Pivoter légèrement la porte pour montrer qu'elle est ouverte
            doorPanel.rotation.y = Math.PI / 6
            doorGroup.add(doorPanel)
            // Poignée
            const doorHandleGeometry = new THREE.SphereGeometry(3, 16, 16)
            const handleMaterialDoor = new THREE.MeshStandardMaterial({
              color: 0xc0c0c0,
              roughness: 0.3,
              metalness: 0.8,
            })
            const handleDoor = new THREE.Mesh(doorHandleGeometry, handleMaterialDoor)
            handleDoor.position.set(element.width / 2 - 15, element.depth / 2, element.height / 2)
            doorGroup.add(handleDoor)
            doorGroup.position.set(element.x + element.width / 2, element.depth / 2, element.y + element.height / 2)
            object = doorGroup
            break
          case "window":
            // Create a window with blue glass as shown in the reference image
            const windowGroup = new THREE.Group()
            // Get parent wall if available
            const parentWall = elements.find((el) => el.id === element.parentWallId)
            // Calculate window height based on wall height and distances
            let windowHeight = element.depth
            let windowVerticalPosition = element.depth / 2
            if (parentWall && element.windowTopDistance !== undefined && element.windowBottomDistance !== undefined) {
              windowHeight = parentWall.depth - element.windowTopDistance - element.windowBottomDistance
              windowVerticalPosition = element.windowBottomDistance + windowHeight / 2
            }
            // Window frame (outer frame)
            const windowFrameThickness = 4
            const windowFrameGeometry = new THREE.BoxGeometry(element.width, windowHeight, element.height)
            const windowFrameMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff, // White frame
              roughness: 0.7,
              metalness: 0.3,
            })
            const windowFrame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial)
            windowFrame.position.set(0, windowVerticalPosition, 0)
            windowGroup.add(windowFrame)
            // Window glass (blue transparent)
            const glassGeometry = new THREE.BoxGeometry(
              element.width - windowFrameThickness,
              windowHeight - windowFrameThickness,
              element.height - windowFrameThickness / 2,
            )
            const glassMaterial = new THREE.MeshPhysicalMaterial({
              color: 0x7fdbff, // Light blue glass
              roughness: 0.1,
              metalness: 0.2,
              transparent: true,
              opacity: 0.6,
              transmission: 0.8,
            })
            const glass = new THREE.Mesh(glassGeometry, glassMaterial)
            glass.position.set(0, windowVerticalPosition, 0)
            windowGroup.add(glass)
            windowGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = windowGroup
            break
          case "shelf":
            // Create a more realistic shelf
            const shelfGroup = new THREE.Group()
            // Top shelf
            const topShelfGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
            const shelfMaterialForShelf = new THREE.MeshStandardMaterial({
              color: 0xa1887f,
              roughness: 0.7,
              metalness: 0.1,
            })
            const topShelf = new THREE.Mesh(topShelfGeometry, shelfMaterialForShelf)
            topShelf.position.set(0, element.depth, 0)
            shelfGroup.add(topShelf)
            // Intermediate shelves
            const numShelvesVal = 3
            for (let i = 1; i < numShelvesVal; i++) {
              const shelfGeometry = new THREE.BoxGeometry(element.width, 3, element.height)
              const shelf = new THREE.Mesh(shelfGeometry, shelfMaterialForShelf)
              shelf.position.set(0, (element.depth * i) / numShelvesVal, 0)
              shelfGroup.add(shelf)
            }
            // Vertical supports
            const pillarGeometry = new THREE.BoxGeometry(3, element.depth, 3)
            const pillarMaterial = new THREE.MeshStandardMaterial({
              color: 0x8d6e63,
              roughness: 0.7,
            })
            // Four pillars at the corners
            const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial)
            pillar1.position.set(-element.width / 2 + 1.5, element.depth / 2, -element.height / 2 + 1.5)
            shelfGroup.add(pillar1)
            const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial)
            pillar2.position.set(element.width / 2 - 1.5, element.depth / 2, -element.height / 2 + 1.5)
            shelfGroup.add(pillar2)
            const pillar3 = new THREE.Mesh(pillarGeometry, pillarMaterial)
            pillar3.position.set(-element.width / 2 + 1.5, element.depth / 2, element.height / 2 - 1.5)
            shelfGroup.add(pillar3)
            const pillar4 = new THREE.Mesh(pillarGeometry, pillarMaterial)
            pillar4.position.set(element.width / 2 - 1.5, element.depth / 2, element.height / 2 - 1.5)
            shelfGroup.add(pillar4)
            shelfGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = shelfGroup
            break
          case "table":
            // Create a more realistic table
            const tableGroup = new THREE.Group()
            // Table top
            const tableTopGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
            const tableTopMaterial = new THREE.MeshStandardMaterial({
              color: 0xc19a6b,
              roughness: 0.5,
              metalness: 0.1,
            })
            const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial)
            tableTop.position.set(0, element.depth - 2.5, 0)
            tableGroup.add(tableTop)
            // Table legs
            const tableLegGeometry = new THREE.CylinderGeometry(3, 3, element.depth - 5, 8)
            const legMaterial = new THREE.MeshStandardMaterial({
              color: 0x8d6e63,
              roughness: 0.7,
            })
            // Four legs at the corners
            const leg1 = new THREE.Mesh(tableLegGeometry, legMaterial)
            leg1.position.set(-element.width / 2 + 10, (element.depth - 5) / 2, -element.height / 2 + 10)
            tableGroup.add(leg1)
            const leg2 = new THREE.Mesh(tableLegGeometry, legMaterial)
            leg2.position.set(element.width / 2 - 10, (element.depth - 5) / 2, -element.height / 2 + 10)
            tableGroup.add(leg2)
            const leg3 = new THREE.Mesh(tableLegGeometry, legMaterial)
            leg3.position.set(-element.width / 2 + 10, (element.depth - 5) / 2, element.height / 2 - 10)
            tableGroup.add(leg3)
            const leg4 = new THREE.Mesh(tableLegGeometry, legMaterial)
            leg4.position.set(element.width / 2 - 10, (element.depth - 5) / 2, element.height / 2 - 10)
            tableGroup.add(leg4)
            tableGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = tableGroup
            break
          case "chair":
            // Create a more realistic chair
            const chairGroup = new THREE.Group()
            // Chair seat
            const seatGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
            const chairMaterial = new THREE.MeshStandardMaterial({
              color: 0x795548,
              roughness: 0.6,
              metalness: 0.1,
            })
            const seat = new THREE.Mesh(seatGeometry, chairMaterial)
            seat.position.set(0, element.depth / 2, 0)
            chairGroup.add(seat)
            // Chair backrest
            const backrestGeometry = new THREE.BoxGeometry(element.width, element.depth / 2, 5)
            const backrest = new THREE.Mesh(backrestGeometry, chairMaterial)
            backrest.position.set(0, element.depth * 0.75, -element.height / 2 + 2.5)
            backrest.rotation.x = Math.PI / 12 // Slight tilt
            chairGroup.add(backrest)
            // Chair legs
            const chairLegGeometry = new THREE.CylinderGeometry(1.5, 1.5, element.depth / 2, 8)
            const chairLegMaterial = new THREE.MeshStandardMaterial({
              color: 0x5d4037,
              roughness: 0.7,
            })
            // Four legs
            const chairLeg1 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
            chairLeg1.position.set(-element.width / 2 + 5, element.depth / 4, -element.height / 2 + 5)
            chairGroup.add(chairLeg1)
            const chairLeg2 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
            chairLeg2.position.set(element.width / 2 - 5, element.depth / 4, -element.height / 2 + 5)
            chairGroup.add(chairLeg2)
            const chairLeg3 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
            chairLeg3.position.set(-element.width / 2 + 5, element.depth / 4, element.height / 2 - 5)
            chairGroup.add(chairLeg3)
            const chairLeg4 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
            chairLeg4.position.set(element.width / 2 - 5, element.depth / 4, element.height / 2 - 5)
            chairGroup.add(chairLeg4)
            chairGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = chairGroup
            break
          case "sofa":
            // Create a more realistic sofa
            const sofaGroup = new THREE.Group()
            // Sofa base
            const sofaBaseGeometry = new THREE.BoxGeometry(element.width, element.depth / 3, element.height)
            const sofaMaterial = new THREE.MeshStandardMaterial({
              color: 0x3f51b5, // Blue color for the sofa
              roughness: 0.8,
              metalness: 0.1,
            })
            const sofaBase = new THREE.Mesh(sofaBaseGeometry, sofaMaterial)
            sofaBase.position.set(0, element.depth / 6, 0)
            sofaGroup.add(sofaBase)
            // Sofa backrest
            const sofaBackrestGeometry = new THREE.BoxGeometry(element.width, element.depth / 2, 10)
            const backrestSofa = new THREE.Mesh(sofaBackrestGeometry, sofaMaterial)
            backrestSofa.position.set(0, element.depth / 3 + element.depth / 4, -element.height / 2 + 5)
            sofaGroup.add(backrestSofa)
            // Sofa armrests
            const armrestGeometry = new THREE.BoxGeometry(10, element.depth / 2, element.height - 20)
            const leftArmrest = new THREE.Mesh(armrestGeometry, sofaMaterial)
            leftArmrest.position.set(-element.width / 2 + 5, element.depth / 3 + element.depth / 4, 10)
            sofaGroup.add(leftArmrest)
            const rightArmrest = new THREE.Mesh(armrestGeometry, sofaMaterial)
            rightArmrest.position.set(element.width / 2 - 5, element.depth / 3 + element.depth / 4, 10)
            sofaGroup.add(rightArmrest)
            // Sofa cushions
            const cushionGeometry = new THREE.BoxGeometry(element.width / 3 - 5, 10, element.height - 20)
            const cushionMaterial = new THREE.MeshStandardMaterial({
              color: 0x303f9f, // Slightly darker blue for cushions
              roughness: 0.9,
              metalness: 0.05,
            })
            // Three cushions
            const leftCushion = new THREE.Mesh(cushionGeometry, cushionMaterial)
            leftCushion.position.set(-element.width / 3, element.depth / 3 + 5, 0)
            sofaGroup.add(leftCushion)
            const middleCushion = new THREE.Mesh(cushionGeometry, cushionMaterial)
            middleCushion.position.set(0, element.depth / 3 + 5, 0)
            sofaGroup.add(middleCushion)
            const rightCushion = new THREE.Mesh(cushionGeometry, cushionMaterial)
            rightCushion.position.set(element.width / 3, element.depth / 3 + 5, 0)
            sofaGroup.add(rightCushion)
            // Sofa legs
            const sofaLegGeometry = new THREE.CylinderGeometry(2, 2, element.depth / 6, 8)
            const sofaLegMaterial = new THREE.MeshStandardMaterial({
              color: 0x5d4037, // Brown for wooden legs
              roughness: 0.7,
            })
            // Four legs
            const sofaLeg1 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
            sofaLeg1.position.set(-element.width / 2 + 10, element.depth / 12, -element.height / 2 + 10)
            sofaGroup.add(sofaLeg1)
            const sofaLeg2 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
            sofaLeg2.position.set(element.width / 2 - 10, element.depth / 12, -element.height / 2 + 10)
            sofaGroup.add(sofaLeg2)
            const sofaLeg3 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
            sofaLeg3.position.set(-element.width / 2 + 10, element.depth / 12, element.height / 2 - 10)
            sofaGroup.add(sofaLeg3)
            const sofaLeg4 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
            sofaLeg4.position.set(element.width / 2 - 10, element.depth / 12, element.height / 2 - 10)
            sofaGroup.add(sofaLeg4)
            sofaGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = sofaGroup
            break
          case "bed":
            // Create a more realistic bed
            const bedGroup = new THREE.Group()
            // Bed base
            const bedBaseGeometry = new THREE.BoxGeometry(element.width, element.depth / 4, element.height)
            const bedBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x8d6e63, // Brown for wooden frame
              roughness: 0.7,
              metalness: 0.1,
            })
            const bedBase = new THREE.Mesh(bedBaseGeometry, bedBaseMaterial)
            bedBase.position.set(0, element.depth / 8, 0)
            bedGroup.add(bedBase)
            // Mattress
            const mattressGeometry = new THREE.BoxGeometry(element.width - 10, element.depth / 4, element.height - 10)
            const mattressMaterial = new THREE.MeshStandardMaterial({
              color: 0xeceff1, // Off-white for mattress
              roughness: 0.9,
              metalness: 0.0,
            })
            const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial)
            mattress.position.set(0, element.depth / 4 + element.depth / 8, 0)
            bedGroup.add(mattress)
            // Pillow
            const pillowGeometry = new THREE.BoxGeometry(element.width / 3, element.depth / 8, element.height / 4)
            const pillowMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff, // White for pillow
              roughness: 0.95,
              metalness: 0.0,
            })
            const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial)
            pillow.position.set(
              0,
              element.depth / 4 + element.depth / 8 + element.depth / 16,
              -element.height / 2 + element.height / 8,
            )
            bedGroup.add(pillow)
            // Blanket
            const blanketGeometry = new THREE.BoxGeometry(element.width - 20, 3, element.height / 2)
            const blanketMaterial = new THREE.MeshStandardMaterial({
              color: 0x1976d2, // Blue for blanket
              roughness: 0.9,
              metalness: 0.0,
            })
            const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial)
            blanket.position.set(0, element.depth / 4 + element.depth / 8 + 1.5, element.height / 4)
            bedGroup.add(blanket)
            // Headboard
            const headboardGeometry = new THREE.BoxGeometry(element.width, element.depth / 2, 10)
            const headboard = new THREE.Mesh(headboardGeometry, bedBaseMaterial)
            headboard.position.set(0, element.depth / 4 + element.depth / 4, -element.height / 2 - 5)
            bedGroup.add(headboard)
            // Bed legs
            const bedLegGeometry = new THREE.CylinderGeometry(3, 3, element.depth / 4, 8)
            // Four legs
            const bedLeg1 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
            bedLeg1.position.set(-element.width / 2 + 15, element.depth / 8, -element.height / 2 + 15)
            bedGroup.add(bedLeg1)
            const bedLeg2 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
            bedLeg2.position.set(element.width / 2 - 15, element.depth / 8, -element.height / 2 + 15)
            bedGroup.add(bedLeg2)
            const bedLeg3 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
            bedLeg3.position.set(-element.width / 2 + 15, element.depth / 8, element.height / 2 - 15)
            bedGroup.add(bedLeg3)
            const bedLeg4 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
            bedLeg4.position.set(element.width / 2 - 15, element.depth / 8, element.height / 2 - 15)
            bedGroup.add(bedLeg4)
            bedGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = bedGroup
            break
          case "fridge":
            // Create a refrigerated display case like the image
            const fridgeGroup = new THREE.Group()
            // Base unit (stainless steel box)
            const baseHeight = element.depth * 0.3
            const baseGeometry = new THREE.BoxGeometry(element.width, baseHeight, element.height)
            const baseMaterial = new THREE.MeshStandardMaterial({
              color: 0xcccccc, // Silver/stainless steel color
              roughness: 0.3,
              metalness: 0.8,
            })
            const base = new THREE.Mesh(baseGeometry, baseMaterial)
            base.position.set(0, baseHeight / 2, 0)
            fridgeGroup.add(base)
            // Control panel on right side
            const controlPanelGeometry = new THREE.BoxGeometry(
              element.width * 0.1,
              baseHeight * 0.6,
              element.height * 0.15,
            )
            const controlPanelMaterial = new THREE.MeshStandardMaterial({
              color: 0x111111,
              roughness: 0.5,
              metalness: 0.7,
            })
            const controlPanel = new THREE.Mesh(controlPanelGeometry, controlPanelMaterial)
            controlPanel.position.set(element.width * 0.4, baseHeight * 0.7, element.height * 0.4)
            fridgeGroup.add(controlPanel)
            // Display case (glass part)
            const caseHeight = element.depth - baseHeight
            const displayCaseWidth = element.width
            const displayCaseHeight = element.height
            // Glass top and sides (transparent)
            const glassMaterialForFridge = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              roughness: 0.1,
              metalness: 0.2,
              transparent: true,
              opacity: 0.3,
              transmission: 0.95,
            })
            // Top glass
            const topGlassGeometry = new THREE.BoxGeometry(displayCaseWidth, 2, displayCaseHeight)
            const topGlass = new THREE.Mesh(topGlassGeometry, glassMaterialForFridge)
            topGlass.position.set(0, element.depth - 1, 0)
            fridgeGroup.add(topGlass)
            // Front glass
            const frontGlassGeometry = new THREE.BoxGeometry(displayCaseWidth, caseHeight, 2)
            const frontGlass = new THREE.Mesh(frontGlassGeometry, glassMaterialForFridge)
            frontGlass.position.set(0, baseHeight + caseHeight / 2, displayCaseHeight / 2)
            fridgeGroup.add(frontGlass)
            // Side glass panels
            const sideGlassGeometry = new THREE.BoxGeometry(2, caseHeight, displayCaseHeight)
            // Left glass
            const leftGlass = new THREE.Mesh(sideGlassGeometry, glassMaterialForFridge)
            leftGlass.position.set(-displayCaseWidth / 2, baseHeight + caseHeight / 2, 0)
            fridgeGroup.add(leftGlass)
            // Right glass
            const rightGlass = new THREE.Mesh(sideGlassGeometry, glassMaterialForFridge)
            rightGlass.position.set(displayCaseWidth / 2, baseHeight + caseHeight / 2, 0)
            fridgeGroup.add(rightGlass)
            // Food trays
            const numTrays = 5
            const trayWidth = displayCaseWidth * 0.9
            const trayHeight = displayCaseHeight * 0.8
            const trayDepth = 10
            const traySpacing = trayWidth / numTrays
            const trayMaterial = new THREE.MeshStandardMaterial({
              color: 0xdddddd, // Light gray for trays
              roughness: 0.5,
              metalness: 0.8,
            })
            for (let i = 0; i < numTrays; i++) {
              const trayGeometry = new THREE.BoxGeometry(traySpacing * 0.9, trayDepth, (trayHeight / numTrays) * 0.9)
              const tray = new THREE.Mesh(trayGeometry, trayMaterial)
              tray.position.set(-trayWidth / 2 + traySpacing / 2 + i * traySpacing, baseHeight + trayDepth / 2, 0)
              fridgeGroup.add(tray)
              // Add some random food items in the trays
              if (Math.random() > 0.3) {
                const foodColors = [0xffeb3b, 0x4caf50, 0xff9800, 0xf44336, 0x2196f3]
                const foodColor = foodColors[Math.floor(Math.random() * foodColors.length)]
                const foodMaterial = new THREE.MeshStandardMaterial({
                  color: foodColor,
                  roughness: 0.7,
                  metalness: 0.1,
                })
                const foodGeometry = new THREE.BoxGeometry(
                  traySpacing * 0.7,
                  Math.random() * 5 + 2,
                  (trayHeight / numTrays) * 0.7,
                )
                const food = new THREE.Mesh(foodGeometry, foodMaterial)
                food.position.set(0, trayDepth / 2 + foodGeometry.parameters.height / 2, 0)
                tray.add(food)
              }
            }
            // Brand logo (KHORIS)
            const logoGeometry = new THREE.PlaneGeometry(displayCaseWidth * 0.15, displayCaseHeight * 0.05)
            const logoMaterial = new THREE.MeshBasicMaterial({
              color: 0x000000, // Black for logo
            })
            const logo = new THREE.Mesh(logoGeometry, logoMaterial)
            logo.position.set(displayCaseWidth * 0.3, baseHeight * 0.7, displayCaseHeight * 0.45)
            fridgeGroup.add(logo)
            // Interior lighting (subtle glow)
            const lightIntensity = 0.5
            const light1 = new THREE.PointLight(0xffffff, lightIntensity)
            light1.position.set(0, element.depth - 10, 0)
            fridgeGroup.add(light1)
            fridgeGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = fridgeGroup
            break
          case "dairy_fridge":
            // Create a dairy products refrigerator like the image
            const dairyFridgeGroup = new THREE.Group()
            // Main cabinet (black box)
            const cabinetWidth = element.width
            const cabinetHeight = element.depth
            const cabinetDepth = element.height
            const cabinetGeometry = new THREE.BoxGeometry(cabinetWidth, cabinetHeight, cabinetDepth)
            const cabinetMaterial = new THREE.MeshStandardMaterial({
              color: 0x111111, // Black cabinet
              roughness: 0.7,
              metalness: 0.3,
            })
            const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial)
            cabinet.position.set(0, cabinetHeight / 2, 0)
            dairyFridgeGroup.add(cabinet)
            // Glass front panel
            const glassWidth = cabinetWidth * 0.95
            const glassHeight = cabinetHeight * 0.8
            const glassThickness = 2
            const glassMaterialDairy = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              roughness: 0.1,
              metalness: 0.2,
              transparent: true,
              opacity: 0.4,
              transmission: 0.9,
            })
            const glassGeometryDairy = new THREE.BoxGeometry(glassWidth, glassHeight, glassThickness)
            const glassFront = new THREE.Mesh(glassGeometryDairy, glassMaterialDairy)
            glassFront.position.set(0, cabinetHeight * 0.55, cabinetDepth / 2 - 1)
            dairyFridgeGroup.add(glassFront)
            // Shelves (5 shelves)
            const numShelvesDairy = 5
            const shelfWidth = cabinetWidth * 0.9
            const shelfDepth = cabinetDepth * 0.8
            const shelfThicknessDairy = 3
            const shelfSpacingDairy = (cabinetHeight * 0.7) / numShelvesDairy
            const shelfMaterialDairy = new THREE.MeshStandardMaterial({
              color: 0xaaaaaa, // Light gray for shelves
              roughness: 0.5,
              metalness: 0.7,
            })
            for (let i = 0; i < numShelvesDairy; i++) {
              const shelfY = cabinetHeight * 0.2 + i * shelfSpacingDairy
              // Main shelf
              const shelfGeometry = new THREE.BoxGeometry(shelfWidth, shelfThicknessDairy, shelfDepth)
              const shelf = new THREE.Mesh(shelfGeometry, shelfMaterialDairy)
              shelf.position.set(0, shelfY, 0)
              dairyFridgeGroup.add(shelf)
              // Shelf front edge (price tag holder)
              const edgeGeometry = new THREE.BoxGeometry(shelfWidth, 5, 2)
              const edgeMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.5,
                metalness: 0.5,
              })
              const edge = new THREE.Mesh(edgeGeometry, edgeMaterial)
              edge.position.set(0, shelfY + 2.5, shelfDepth / 2)
              dairyFridgeGroup.add(edge)
              // Add some dairy products on each shelf
              if (Math.random() > 0.3) {
                const numProducts = Math.floor(Math.random() * 5) + 3
                const productWidth = shelfWidth / numProducts
                for (let j = 0; j < numProducts; j++) {
                  // Random product type (milk carton, yogurt, etc.)
                  const productType = Math.floor(Math.random() * 3)
                  let productGeometry, productHeight
                  if (productType === 0) {
                    // Milk carton
                    productGeometry = new THREE.BoxGeometry(productWidth * 0.7, 20, productWidth * 0.7)
                    productHeight = 20
                  } else if (productType === 1) {
                    // Yogurt cup
                    productGeometry = new THREE.CylinderGeometry(productWidth * 0.3, productWidth * 0.25, 10, 8)
                    productHeight = 10
                  } else {
                    // Cheese block
                    productGeometry = new THREE.BoxGeometry(productWidth * 0.6, 8, productWidth * 0.8)
                    productHeight = 8
                  }
                  // Random dairy product colors
                  const productColors = [0xffffff, 0xf0f0f0, 0xfffacd, 0xffffe0]
                  const productColor = productColors[Math.floor(Math.random() * productColors.length)]
                  const productMaterial = new THREE.MeshStandardMaterial({
                    color: productColor,
                    roughness: 0.7,
                    metalness: 0.1,
                  })
                  const product = new THREE.Mesh(productGeometry, productMaterial)
                  // Position along the shelf
                  const x = -shelfWidth / 2 + productWidth / 2 + j * productWidth
                  const y = shelfY + shelfThicknessDairy / 2 + productHeight / 2
                  const z = Math.random() * (shelfDepth * 0.8) - shelfDepth * 0.4
                  product.position.set(x, y, z)
                  dairyFridgeGroup.add(product)
                }
              }
            }
            // Bottom section (black)
            const bottomSectionGeometry = new THREE.BoxGeometry(cabinetWidth, cabinetHeight * 0.15, cabinetDepth)
            const bottomSection = new THREE.Mesh(bottomSectionGeometry, cabinetMaterial)
            bottomSection.position.set(0, cabinetHeight * 0.075, 0)
            dairyFridgeGroup.add(bottomSection)
            // Top light strip
            const lightStripGeometry = new THREE.BoxGeometry(cabinetWidth * 0.9, 2, 5)
            const lightStripMaterial = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 0.3,
              metalness: 0.8,
              emissive: 0xffffff,
              emissiveIntensity: 0.5,
            })
            const lightStrip = new THREE.Mesh(lightStripGeometry, lightStripMaterial)
            lightStrip.position.set(0, cabinetHeight * 0.95, cabinetDepth / 2 - 5)
            dairyFridgeGroup.add(lightStrip)
            // Interior lighting
            const lightIntensityDairy = 0.5
            const light = new THREE.PointLight(0xffffff, lightIntensityDairy)
            light.position.set(0, cabinetHeight * 0.7, 0)
            dairyFridgeGroup.add(light)
            dairyFridgeGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = dairyFridgeGroup
            break
          case "counter":
            // Create a more realistic counter
            const counterGroup = new THREE.Group()
            // Counter base
            const counterBaseGeometry = new THREE.BoxGeometry(element.width, element.depth - 5, element.height)
            const counterBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x5d4037, // Dark brown for cabinet
              roughness: 0.7,
              metalness: 0.1,
            })
            const counterBase = new THREE.Mesh(counterBaseGeometry, counterBaseMaterial)
            counterBase.position.set(0, (element.depth - 5) / 2, 0)
            counterGroup.add(counterBase)
            // Counter top
            const counterTopGeometry = new THREE.BoxGeometry(element.width + 10, 5, element.height + 10)
            const counterTopMaterial = new THREE.MeshStandardMaterial({
              color: 0xeceff1, // Light gray for countertop
              roughness: 0.4,
              metalness: 0.6,
            })
            const counterTop = new THREE.Mesh(counterTopGeometry, counterTopMaterial)
            counterTop.position.set(0, element.depth - 2.5, 0)
            counterGroup.add(counterTop)
            // Drawer handles
            const drawerHandleGeometry = new THREE.BoxGeometry(20, 2, 2)
            const drawerHandleMaterial = new THREE.MeshStandardMaterial({
              color: 0x9e9e9e, // Silver for handles
              roughness: 0.3,
              metalness: 0.9,
            })
            // Add multiple drawer handles
            for (let i = 0; i < 3; i++) {
              const drawerHandle = new THREE.Mesh(drawerHandleGeometry, drawerHandleMaterial)
              drawerHandle.position.set(((i - 1) * element.width) / 3, element.depth / 2, element.height / 2 + 0.1)
              counterGroup.add(drawerHandle)
            }
            counterGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = counterGroup
            break
          case "cashier":
            // Create a more realistic cashier counter
            const cashierGroup = new THREE.Group()
            // Counter base
            const cashierBaseGeometry = new THREE.BoxGeometry(element.width, element.depth - 10, element.height)
            const cashierBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x5d4037, // Dark brown for cabinet
              roughness: 0.7,
              metalness: 0.1,
            })
            const cashierBase = new THREE.Mesh(cashierBaseGeometry, cashierBaseMaterial)
            cashierBase.position.set(0, (element.depth - 10) / 2, 0)
            cashierGroup.add(cashierBase)
            // Counter top
            const cashierTopGeometry = new THREE.BoxGeometry(element.width + 10, 5, element.height + 10)
            const cashierTopMaterial = new THREE.MeshStandardMaterial({
              color: 0xeceff1, // Light gray for countertop
              roughness: 0.4,
              metalness: 0.6,
            })
            const cashierTop = new THREE.Mesh(cashierTopGeometry, cashierTopMaterial)
            cashierTop.position.set(0, element.depth - 7.5, 0)
            cashierGroup.add(cashierTop)
            // Cash register
            const registerGeometry = new THREE.BoxGeometry(element.width / 3, 15, element.height / 3)
            const registerMaterial = new THREE.MeshStandardMaterial({
              color: 0x212121, // Dark gray for register
              roughness: 0.5,
              metalness: 0.7,
            })
            const register = new THREE.Mesh(registerGeometry, registerMaterial)
            register.position.set(-element.width / 4, element.depth - 7.5 + 7.5, 0)
            cashierGroup.add(register)
            // Register screen
            const screenGeometry = new THREE.BoxGeometry(element.width / 4, 10, 2)
            const screenMaterial = new THREE.MeshStandardMaterial({
              color: 0x2196f3, // Blue for screen
              roughness: 0.2,
              metalness: 0.8,
              emissive: 0x2196f3,
              emissiveIntensity: 0.5,
            })
            const screen = new THREE.Mesh(screenGeometry, screenMaterial)
            screen.position.set(-element.width / 4, element.depth - 7.5 + 15, -element.height / 6 - 1)
            screen.rotation.x = -Math.PI / 6
            cashierGroup.add(screen)
            // Card reader
            const cardReaderGeometry = new THREE.BoxGeometry(10, 5, 15)
            const cardReaderMaterial = new THREE.MeshStandardMaterial({
              color: 0x424242, // Dark gray for card reader
              roughness: 0.5,
              metalness: 0.7,
            })
            const cardReader = new THREE.Mesh(cardReaderGeometry, cardReaderMaterial)
            cardReader.position.set(element.width / 4, element.depth - 7.5 + 2.5, -element.height / 4)
            cashierGroup.add(cardReader)
            cashierGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = cashierGroup
            break
          case "rack":
            // Create a more realistic clothes rack
            const rackGroup = new THREE.Group()
            // Horizontal bar
            const barGeometry = new THREE.CylinderGeometry(2, 2, element.width, 8)
            barGeometry.rotateZ(Math.PI / 2) // Rotate to make it horizontal
            const barMaterial = new THREE.MeshStandardMaterial({
              color: 0x9e9e9e, // Silver for metal bar
              roughness: 0.3,
              metalness: 0.9,
            })
            const bar = new THREE.Mesh(barGeometry, barMaterial)
            bar.position.set(0, element.depth - 10, 0)
            rackGroup.add(bar)
            // Vertical supports
            const supportGeometry = new THREE.CylinderGeometry(2, 2, element.depth - 10, 8)
            const leftSupport = new THREE.Mesh(supportGeometry, barMaterial)
            leftSupport.position.set(-element.width / 2 + 2, (element.depth - 10) / 2, 0)
            rackGroup.add(leftSupport)
            const rightSupport = new THREE.Mesh(supportGeometry, barMaterial)
            rightSupport.position.set(element.width / 2 - 2, (element.depth - 10) / 2, 0)
            rackGroup.add(rightSupport)
            // Base
            const rackBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height / 2)
            const rackBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x424242, // Dark gray for base
              roughness: 0.5,
              metalness: 0.7,
            })
            const rackBase = new THREE.Mesh(rackBaseGeometry, rackBaseMaterial)
            rackBase.position.set(0, 2.5, 0)
            rackGroup.add(rackBase)
            // Add some clothes hangers
            const hangerCount = Math.floor(element.width / 15)
            const hangerGeometry = new THREE.TorusGeometry(5, 0.5, 8, 16, Math.PI)
            const hangerMaterial = new THREE.MeshStandardMaterial({
              color: 0xbdbdbd, // Light gray for hangers
              roughness: 0.5,
              metalness: 0.7,
            })
            for (let i = 0; i < hangerCount; i++) {
              const hanger = new THREE.Mesh(hangerGeometry, hangerMaterial)
              hanger.rotation.x = Math.PI / 2
              hanger.position.set(
                -element.width / 2 + 10 + (i * (element.width - 20)) / (hangerCount - 1),
                element.depth - 15,
                0,
              )
              rackGroup.add(hanger)
              // Add a simple shirt shape to some hangers
              if (i % 2 === 0) {
                const shirtGeometry = new THREE.BoxGeometry(25, 20, 15)
                const shirtMaterial = new THREE.MeshStandardMaterial({
                  color: Math.random() > 0.5 ? 0x2196f3 : 0xe91e63, // Random blue or pink
                  roughness: 0.9,
                  metalness: 0.1,
                })
                const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial)
                shirt.position.set(0, -7.5, 0)
                hanger.add(shirt)
              }
            }
            rackGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = rackGroup
            break
          case "mannequin":
            // Create a more realistic mannequin
            const mannequinGroup = new THREE.Group()
            // Mannequin body parts
            const headGeometry = new THREE.SphereGeometry(7, 16, 16)
            const bodyGeometry = new THREE.CylinderGeometry(10, 8, 40, 16)
            const armGeometry = new THREE.CylinderGeometry(3, 3, 30, 16)
            const legGeometry = new THREE.CylinderGeometry(4, 3, 50, 16)
            const mannequinMaterial = new THREE.MeshStandardMaterial({
              color: 0xf5f5f5, // White for mannequin
              roughness: 0.5,
              metalness: 0.1,
            })
            // Head
            const head = new THREE.Mesh(headGeometry, mannequinMaterial)
            head.position.set(0, element.depth - 20, 0)
            mannequinGroup.add(head)
            // Body
            const body = new THREE.Mesh(bodyGeometry, mannequinMaterial)
            body.position.set(0, element.depth - 45, 0)
            mannequinGroup.add(body)
            // Arms
            const leftArm = new THREE.Mesh(armGeometry, mannequinMaterial)
            leftArm.position.set(-15, element.depth - 45, 0)
            leftArm.rotation.z = -Math.PI / 16
            mannequinGroup.add(leftArm)
            const rightArm = new THREE.Mesh(armGeometry, mannequinMaterial)
            rightArm.position.set(15, element.depth - 45, 0)
            rightArm.rotation.z = Math.PI / 16
            mannequinGroup.add(rightArm)
            // Legs
            const leftLeg = new THREE.Mesh(legGeometry, mannequinMaterial)
            leftLeg.position.set(-6, element.depth - 90, 0)
            mannequinGroup.add(leftLeg)
            const rightLeg = new THREE.Mesh(legGeometry, mannequinMaterial)
            rightLeg.position.set(6, element.depth - 90, 0)
            mannequinGroup.add(rightLeg)
            // Add some clothing (simple shirt)
            const shirtGeometry = new THREE.BoxGeometry(25, 20, 15)
            const shirtMaterial = new THREE.MeshStandardMaterial({
              color: 0x2196f3, // Blue shirt
              roughness: 0.9,
              metalness: 0.1,
            })
            const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial)
            shirt.position.set(0, element.depth - 45, 0)
            mannequinGroup.add(shirt)
            // Base
            const mannequinBaseGeometry = new THREE.CylinderGeometry(15, 15, 5, 16)
            const mannequinBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x424242, // Dark gray for base
              roughness: 0.5,
              metalness: 0.7,
            })
            const mannequinBase = new THREE.Mesh(mannequinBaseGeometry, mannequinBaseMaterial)
            mannequinBase.position.set(0, 2.5, 0)
            mannequinGroup.add(mannequinBase)
            mannequinGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = mannequinGroup
            break
          case "plant":
            // Create a more realistic plant
            const plantGroup = new THREE.Group()
            // Pot
            const potGeometry = new THREE.CylinderGeometry(element.width / 2, element.width / 3, element.depth / 3, 16)
            const potMaterial = new THREE.MeshStandardMaterial({
              color: 0x795548, // Brown for pot
              roughness: 0.8,
              metalness: 0.1,
            })
            const pot = new THREE.Mesh(potGeometry, potMaterial)
            pot.position.set(0, element.depth / 6, 0)
            plantGroup.add(pot)
            // Soil
            const soilGeometry = new THREE.CylinderGeometry(element.width / 2 - 2, element.width / 2 - 2, 3, 16)
            const soilMaterial = new THREE.MeshStandardMaterial({
              color: 0x3e2723, // Dark brown for soil
              roughness: 1.0,
              metalness: 0.0,
            })
            const soil = new THREE.Mesh(soilGeometry, soilMaterial)
            soil.position.set(0, element.depth / 3, 0)
            plantGroup.add(soil)
            // Plant stem
            const stemGeometry = new THREE.CylinderGeometry(1, 2, (element.depth * 2) / 3, 8)
            const stemMaterial = new THREE.MeshStandardMaterial({
              color: 0x33691e, // Dark green for stem
              roughness: 0.9,
              metalness: 0.1,
            })
            const stem = new THREE.Mesh(stemGeometry, stemMaterial)
            stem.position.set(0, (element.depth * 2) / 3, 0)
            plantGroup.add(stem)
            // Create leaves
            const leafGeometry = new THREE.SphereGeometry(element.width / 4, 8, 8)
            const leafMaterial = new THREE.MeshStandardMaterial({
              color: 0x4caf50, // Green for leaves
              roughness: 0.9,
              metalness: 0.1,
            })
            // Add multiple leaves at different positions
            for (let i = 0; i < 8; i++) {
              const leaf = new THREE.Mesh(leafGeometry, leafMaterial)
              const angle = (i / 8) * Math.PI * 2
              const radius = element.width / 3
              const height = element.depth / 2 + (Math.random() * element.depth) / 2
              leaf.position.set(Math.cos(angle) * radius, element.depth / 3 + height, Math.sin(angle) * radius)
              // Scale leaves randomly
              const scale = 0.7 + Math.random() * 0.6
              leaf.scale.set(scale, scale, scale)
              plantGroup.add(leaf)
            }
            plantGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = plantGroup
            break
          case "display":
            // Create a more realistic display stand
            const displayGroup = new THREE.Group()
            // Base
            const displayBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
            const displayBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x5d4037, // Dark brown for base
              roughness: 0.7,
              metalness: 0.1,
            })
            const displayBase = new THREE.Mesh(displayBaseGeometry, displayBaseMaterial)
            displayBase.position.set(0, 2.5, 0)
            displayGroup.add(displayBase)
            // Display surface
            const surfaceGeometry = new THREE.BoxGeometry(element.width - 10, 2, element.height - 10)
            const surfaceMaterial = new THREE.MeshStandardMaterial({
              color: 0xeceff1, // Light gray for surface
              roughness: 0.4,
              metalness: 0.6,
            })
            const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
            surface.position.set(0, 6, 0)
            displayGroup.add(surface)
            // Display items (random products)
            const numProducts = Math.floor(Math.random() * 5) + 3
            const productColors = [0xe91e63, 0x2196f3, 0xffeb3b, 0x4caf50, 0xff9800]
            for (let i = 0; i < numProducts; i++) {
              // Random product type (box or cylinder)
              const isBox = Math.random() > 0.5
              let productGeometry
              if (isBox) {
                const width = 10 + Math.random() * 15
                const height = 10 + Math.random() * 15
                const depth = 10 + Math.random() * 15
                productGeometry = new THREE.BoxGeometry(width, height, depth)
              } else {
                const radius = 5 + Math.random() * 7
                const height = 10 + Math.random() * 15
                productGeometry = new THREE.CylinderGeometry(radius, radius, height, 16)
              }
              const productMaterial = new THREE.MeshStandardMaterial({
                color: productColors[Math.floor(Math.random() * productColors.length)],
                roughness: 0.7,
                metalness: 0.3,
              })
              const product = new THREE.Mesh(productGeometry, productMaterial)
              // Position randomly on the display
              const x = (Math.random() - 0.5) * (element.width - 30)
              const z = (Math.random() - 0.5) * (element.height - 30)
              const y = 7 + (isBox ? productGeometry.parameters.height / 2 : productGeometry.parameters.height / 2)
              product.position.set(x, y, z)
              displayGroup.add(product)
            }
            displayGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = displayGroup
            break
          case "gondola":
            // Create a more realistic gondola shelf unit
            const gondolaGroup = new THREE.Group()
            // Base
            const gondolaBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
            const gondolaBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x424242, // Dark gray for base
              roughness: 0.5,
              metalness: 0.7,
            })
            const gondolaBase = new THREE.Mesh(gondolaBaseGeometry, gondolaBaseMaterial)
            gondolaBase.position.set(0, 2.5, 0)
            gondolaGroup.add(gondolaBase)
            // Back panel
            const backPanelGeometry = new THREE.BoxGeometry(element.width, element.depth, 2)
            const backPanelMaterial = new THREE.MeshStandardMaterial({
              color: 0x616161, // Gray for back panel
              roughness: 0.7,
              metalness: 0.3,
            })
            const backPanel = new THREE.Mesh(backPanelGeometry, backPanelMaterial)
            backPanel.position.set(0, element.depth / 2, -element.height / 2 + 1)
            gondolaGroup.add(backPanel)
            // Shelves
            const shelfGeometry = new THREE.BoxGeometry(element.width, 2, element.height)
            const shelfMaterial = new THREE.MeshStandardMaterial({
              color: 0x9e9e9e, // Light gray for shelves
              roughness: 0.5,
              metalness: 0.5,
            })
            const numShelvesForGondola = 4
            for (let i = 0; i < numShelvesForGondola; i++) {
              const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial)
              shelf.position.set(0, (i + 1) * (element.depth / numShelvesForGondola), 0)
              gondolaGroup.add(shelf)
              // Add products to each shelf
              const productsPerShelf = Math.floor(Math.random() * 4) + 2
              const productColors = [0xe91e63, 0x2196f3, 0xffeb3b, 0x4caf50, 0xff9800]
              for (let j = 0; j < productsPerShelf; j++) {
                const productWidth = 15
                const productHeight = 20
                const productDepth = 10
                const productGeometry = new THREE.BoxGeometry(productWidth, productHeight, productDepth)
                const productMaterial = new THREE.MeshStandardMaterial({
                  color: productColors[Math.floor(Math.random() * productColors.length)],
                  roughness: 0.7,
                  metalness: 0.3,
                })
                const product = new THREE.Mesh(productGeometry, productMaterial)
                // Position along the shelf
                const x = (j - (productsPerShelf - 1) / 2) * (element.width / productsPerShelf)
                const y = (i + 1) * (element.depth / numShelvesForGondola) + productHeight / 2 + 1
                const z = 0
                product.position.set(x, y, z)
                gondolaGroup.add(product)
              }
            }
            gondolaGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = gondolaGroup
            break
          case "planogram":
            // Create a more realistic planogram display
            const planogramGroup = new THREE.Group()
            // Base structure
            const planogramBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
            const planogramBaseMaterial = new THREE.MeshStandardMaterial({
              color: 0x424242, // Dark gray for base
              roughness: 0.5,
              metalness: 0.7,
            })
            const planogramBase = new THREE.Mesh(planogramBaseGeometry, planogramBaseMaterial)
            planogramBase.position.set(0, 2.5, 0)
            planogramGroup.add(planogramBase)
            // Back panel
            const planogramBackPanelGeometry = new THREE.BoxGeometry(element.width, element.depth, 2)
            const planogramBackPanelMaterial = new THREE.MeshStandardMaterial({
              color: 0x616161, // Gray for back panel
              roughness: 0.7,
              metalness: 0.3,
            })
            const planogramBackPanel = new THREE.Mesh(planogramBackPanelGeometry, planogramBackPanelMaterial)
            planogramBackPanel.position.set(0, element.depth / 2, -element.height / 2 + 1)
            planogramGroup.add(planogramBackPanel)
            // Shelves
            const planogramShelfGeometry = new THREE.BoxGeometry(element.width, 2, element.height - 4)
            const planogramShelfMaterial = new THREE.MeshStandardMaterial({
              color: 0x9e9e9e, // Light gray for shelves
              roughness: 0.5,
              metalness: 0.5,
            })
            // Add multiple shelves
            const numPlanogramShelves = 5
            for (let i = 0; i < numPlanogramShelves; i++) {
              const shelf = new THREE.Mesh(planogramShelfGeometry, planogramShelfMaterial)
              shelf.position.set(0, (i + 1) * (element.depth / (numPlanogramShelves + 1)), 0)
              planogramGroup.add(shelf)
              // Add products to each shelf in a more organized way (planogram style)
              const productsPerRow = 6
              const productRows = 2
              for (let row = 0; row < productRows; row++) {
                for (let j = 0; j < productsPerRow; j++) {
                  // Create product with consistent size for planogram
                  const productWidth = (element.width - 20) / productsPerRow
                  const productHeight = 15
                  const productDepth = (element.height - 10) / productRows / 2
                  const productGeometry = new THREE.BoxGeometry(productWidth - 2, productHeight, productDepth - 2)
                  // Use consistent colors for each product type (row)
                  const productColor = row === 0 ? 0x2196f3 : 0xff9800 // Blue for first row, orange for second
                  const productMaterial = new THREE.MeshStandardMaterial({
                    color: productColor,
                    roughness: 0.7,
                    metalness: 0.3,
                  })
                  const product = new THREE.Mesh(productGeometry, productMaterial)
                  // Position products in a grid pattern
                  const x = (j - (productsPerRow - 1) / 2) * productWidth
                  const y = (i + 1) * (element.depth / (numPlanogramShelves + 1)) + productHeight / 2 + 1
                  const z = (row - (productRows - 1) / 2) * productDepth
                  product.position.set(x, y, z)
                  planogramGroup.add(product)
                  // Add product label (small white rectangle on front)
                  const labelGeometry = new THREE.PlaneGeometry(productWidth - 4, 5)
                  const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
                  const label = new THREE.Mesh(labelGeometry, labelMaterial)
                  label.position.set(0, -productHeight / 4, productDepth / 2 + 0.1)
                  label.rotation.x = Math.PI / 2
                  product.add(label)
                }
              }
            }
            planogramGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = planogramGroup
            break
          case "cube":
            // Create a shelf unit like the image
            const cubeGroup = new THREE.Group()
            // Define materials
            const frameMaterialCube = new THREE.MeshStandardMaterial({
              color: 0x3e2723, // Dark brown for frame
              roughness: 0.7,
              metalness: 0.2,
            })
            const glassMaterialCube = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              roughness: 0.1,
              metalness: 0.1,
              transparent: true,
              opacity: 0.2,
              transmission: 0.95,
            })
            // Dimensions
            const width = element.width
            const height = element.depth
            const depth = element.height
            const frameThickness = 5
            const shelfThickness = 5
            const numShelves = 4
            // Back panel (glass)
            const backPanelCube = new THREE.Mesh(new THREE.BoxGeometry(width, height, 1), glassMaterialCube)
            backPanelCube.position.set(0, height / 2, -depth / 2)
            cubeGroup.add(backPanelCube)
            // Left panel (glass)
            const leftPanelCube = new THREE.Mesh(new THREE.BoxGeometry(1, height, depth), glassMaterialCube)
            leftPanelCube.position.set(-width / 2, height / 2, 0)
            cubeGroup.add(leftPanelCube)
            // Right panel (glass)
            const rightPanelCube = new THREE.Mesh(new THREE.BoxGeometry(1, height, depth), glassMaterialCube)
            rightPanelCube.position.set(width / 2, height / 2, 0)
            cubeGroup.add(rightPanelCube)
            // Vertical frames
            // Left front
            const leftFrontFrame = new THREE.Mesh(
              new THREE.BoxGeometry(frameThickness, height, frameThickness),
              frameMaterialCube,
            )
            leftFrontFrame.position.set(-width / 2 + frameThickness / 2, height / 2, depth / 2 - frameThickness / 2)
            cubeGroup.add(leftFrontFrame)
            // Right front
            const rightFrontFrame = new THREE.Mesh(
              new THREE.BoxGeometry(frameThickness, height, frameThickness),
              frameMaterialCube,
            )
            rightFrontFrame.position.set(width / 2 - frameThickness / 2, height / 2, depth / 2 - frameThickness / 2)
            cubeGroup.add(rightFrontFrame)
            // Left back
            const leftBackFrame = new THREE.Mesh(
              new THREE.BoxGeometry(frameThickness, height, frameThickness),
              frameMaterialCube,
            )
            leftBackFrame.position.set(-width / 2 + frameThickness / 2, height / 2, -depth / 2 + frameThickness / 2)
            cubeGroup.add(leftBackFrame)
            // Right back
            const rightBackFrame = new THREE.Mesh(
              new THREE.BoxGeometry(frameThickness, height, frameThickness),
              frameMaterialCube,
            )
            rightBackFrame.position.set(width / 2 - frameThickness / 2, height / 2, -depth / 2 + frameThickness / 2)
            cubeGroup.add(rightBackFrame)
            // Horizontal shelves
            const shelfSpacing = height / numShelves
            for (let i = 0; i < numShelves; i++) {
              const shelfY = i * shelfSpacing
              const shelf = new THREE.Mesh(new THREE.BoxGeometry(width, shelfThickness, depth), frameMaterialCube)
              shelf.position.set(0, shelfY + shelfThickness / 2, 0)
              cubeGroup.add(shelf)
              // Add horizontal supports at the front and back if not the top shelf
              if (i < numShelves - 1) {
                // Front horizontal support
                const frontSupport = new THREE.Mesh(
                  new THREE.BoxGeometry(width - frameThickness * 2, frameThickness, frameThickness),
                  frameMaterialCube,
                )
                frontSupport.position.set(0, shelfY + shelfSpacing / 2 + shelfThickness, depth / 2 - frameThickness / 2)
                cubeGroup.add(frontSupport)
                // Back horizontal support
                const backSupport = new THREE.Mesh(
                  new THREE.BoxGeometry(width - frameThickness * 2, frameThickness, frameThickness),
                  frameMaterialCube,
                )
                backSupport.position.set(0, shelfY + shelfSpacing / 2 + shelfThickness, -depth / 2 + frameThickness / 2)
                cubeGroup.add(backSupport)
              }
            }
            cubeGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
            object = cubeGroup
            break
          default:
            geometry = new THREE.BoxGeometry(element.width, element.depth, element.height)
            material = new THREE.MeshStandardMaterial({
              color,
              roughness: 0.7,
              metalness: 0.3,
            })
            object = new THREE.Mesh(geometry, material)
            object.position.set(element.x + element.width / 2, element.depth / 2, element.y + element.height / 2)
        }

        // Appliquer la rotation
        object.rotation.y = (element.rotation * Math.PI) / 180
        // Ajouter les ombres
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        // Ajouter à la scène
        sceneRef.current.add(object)
        objectsRef.current.set(element.id, object)
      },
      [elements],
    )

    // Function to update the position of a 3D object
    const update3DObjectPosition = useCallback(
      (elementId: string) => {
        const element = elements.find((el) => el.id === elementId)
        const object = objectsRef.current.get(elementId)
        if (element && object && sceneRef.current) {
          // Conserver la hauteur y actuelle pour maintenir l'objet sur le sol
          const currentY = object.position.y
          object.position.set(element.x + element.width / 2, currentY, element.y + element.height / 2)
        }
      },
      [elements],
    )

    // Function to update the size of a 3D object
    const update3DObjectSize = useCallback(
      (elementId: string) => {
        const element = elements.find((el) => el.id === elementId)
        const object = objectsRef.current.get(elementId)
        if (element && object && sceneRef.current) {
          // For all objects, it is simpler to recreate them
          sceneRef.current.remove(object)
          objectsRef.current.delete(elementId)
          add3DObject(element)
        }
      },
      [elements, add3DObject],
    )

    // Function to update the rotation of a 3D object
    const update3DObjectRotation = useCallback(
      (elementId: string) => {
        const element = elements.find((el) => el.id === elementId)
        const object = objectsRef.current.get(elementId)
        if (element && object) {
          object.rotation.y = (element.rotation * Math.PI) / 180
        }
      },
      [elements],
    )

    // Function to remove a 3D object
    const remove3DObject = useCallback((elementId: string) => {
      const object = objectsRef.current.get(elementId)
      if (object && sceneRef.current) {
        sceneRef.current.remove(object)
        objectsRef.current.delete(elementId)
      }
    }, [])

    // Function to update all elements (e.g., on import or initial load)
    const updateAllElements = useCallback(
      (newElements: Element[]) => {
        if (!sceneRef.current) return

        // Remove all existing objects
        objectsRef.current.forEach((object) => {
          sceneRef.current?.remove(object)
        })
        objectsRef.current.clear()

        // Add new objects
        newElements.forEach((element) => {
          add3DObject(element)
        })

        // Recalculate center and update camera/controls
        const center = calculatePlanCenter()
        if (cameraRef.current && controlsRef.current) {
          let minX = Number.POSITIVE_INFINITY
          let maxX = Number.NEGATIVE_INFINITY
          let minY = Number.POSITIVE_INFINITY
          let maxY = Number.NEGATIVE_INFINITY
          newElements.forEach((element) => {
            minX = Math.min(minX, element.x)
            maxX = Math.max(maxX, element.x + element.width)
            minY = Math.min(minY, element.y)
            maxY = Math.max(maxY, element.y + element.height)
          })
          const width = maxX - minX
          const height = maxY - minY
          const size = Math.max(width, height)
          const distance = Math.max(size * 1.5, 300)
          cameraRef.current.position.set(center.x, distance / 2, center.y + distance)
          controlsRef.current.target.set(center.x, 0, center.y)
          controlsRef.current.update()
        }
      },
      [add3DObject, calculatePlanCenter],
    )

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
      add3DObject,
      update3DObjectPosition,
      update3DObjectSize,
      update3DObjectRotation,
      remove3DObject,
      updateAllElements,
      renderScene: () => {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
      },
      getDomElement: () => rendererRef.current?.domElement || null,
    }))

    // Effect to initialize the 3D scene
    useEffect(() => {
      if (threeContainerRef.current) {
        // Initialiser la scène Three.js
        const container = threeContainerRef.current
        const width = container.clientWidth
        const height = container.clientHeight

        // Créer la scène
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf0f0f0)
        sceneRef.current = scene

        // Créer la caméra
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
        // Positionner la caméra en fonction du centre du plan
        const center = calculatePlanCenter()
        camera.position.set(center.x, 200, center.y + 300)
        cameraRef.current = camera

        // Créer le renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(width, height)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        container.innerHTML = ""
        container.appendChild(renderer.domElement)
        rendererRef.current = renderer

        // Ajouter les contrôles
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.25
        controls.screenSpacePanning = false
        controls.maxPolarAngle = Math.PI / 2
        controls.target.set(center.x, 0, center.y) // Cibler le centre du plan
        controlsRef.current = controls
        controls.enableZoom = true
        controls.zoomSpeed = 1.0
        controls.minDistance = 50
        controls.maxDistance = 1000

        // Ajouter better lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        // Main directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(200, 400, 200)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        directionalLight.shadow.camera.near = 0.5
        directionalLight.shadow.camera.far = 1000
        directionalLight.shadow.camera.left = -500
        directionalLight.shadow.camera.right = 500
        directionalLight.shadow.camera.top = 500
        directionalLight.shadow.camera.bottom = -500
        scene.add(directionalLight)

        // Add a fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
        fillLight.position.set(-200, 200, -200)
        scene.add(fillLight)

        // Add a subtle blue-ish rim light
        const rimLight = new THREE.DirectionalLight(0xadd8e6, 0.2)
        rimLight.position.set(0, 100, -300)
        scene.add(rimLight)

        // Calculer les dimensions nécessaires pour le sol
        let minX = Number.POSITIVE_INFINITY
        let maxX = Number.NEGATIVE_INFINITY
        let minZ = Number.POSITIVE_INFINITY
        let maxZ = Number.NEGATIVE_INFINITY
        elements.forEach((element) => {
          minX = Math.min(minX, element.x)
          maxX = Math.max(maxX, element.x + element.width)
          minZ = Math.min(minZ, element.y)
          maxZ = Math.max(maxZ, element.y + element.height)
        })

        // Ajouter une marge importante pour s'assurer que le sol couvre toute la zone
        const margin = 1000
        minX -= margin
        maxX += margin
        minZ -= margin
        maxZ += margin

        const groundWidth = Math.max(2000, maxX - minX)
        const groundDepth = Math.max(2000, maxZ - minZ)

        // Ajouter un sol beaucoup plus grand
        const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundDepth)
        const groundMaterial = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.8,
          metalness: 0.2,
        })
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = 0 // S'assurer que le sol est à y=0
        ground.position.x = center.x // Centrer le sol sur le plan
        ground.position.z = center.y // Centrer le sol sur le plan
        ground.receiveShadow = true
        scene.add(ground)

        // Ajouter une grille qui couvre toute la zone
        const gridHelper = new THREE.GridHelper(Math.max(groundWidth, groundDepth), 100)
        gridHelper.position.y = 0.1 // Légèrement au-dessus du sol pour éviter le z-fighting
        gridHelper.position.x = center.x // Centrer la grille sur le plan
        gridHelper.position.z = center.y // Centrer la grille sur le plan
        scene.add(gridHelper)

        // Ajouter les objets existants
        elements.forEach((element) => {
          add3DObject(element)
        })

        // Fonction d'animation
        const animate = () => {
          requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()

        // Gérer le redimensionnement de la fenêtre
        const handleResize = () => {
          if (container && cameraRef.current && rendererRef.current) {
            const width = container.clientWidth
            const height = container.clientHeight
            cameraRef.current.aspect = width / height
            cameraRef.current.updateProjectionMatrix()
            rendererRef.current.setSize(width, height)
          }
        }
        window.addEventListener("resize", handleResize)

        return () => {
          window.removeEventListener("resize", handleResize)
          if (rendererRef.current) {
            container.removeChild(rendererRef.current.domElement)
          }
          // Nettoyer les objets 3D
          objectsRef.current.clear()
        }
      }
    }, [calculatePlanCenter, elements, add3DObject])

    return <div ref={threeContainerRef} className="w-full h-full" />
  },
)

FloorPlan3DViewer.displayName = "FloorPlan3DViewer"
