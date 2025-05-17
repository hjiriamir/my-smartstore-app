"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, Rect, Line, Group, Path, Circle, Triangle, IText, Ellipse } from "fabric"
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

import {
  FaTrash,
  FaSave,
  FaHome,
  FaDoorOpen,
  FaWindowMaximize,
  FaTable,
  FaBoxOpen,
  FaCircle,
  FaSquare,
  FaSlash,
  FaMousePointer,
  FaRuler,
  FaDrawPolygon,
  FaFont,
  FaChevronDown,
  FaChevronRight,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaMinus,
  FaBold,
  FaItalic,
  FaUnderline,
} from "react-icons/fa"

const Planogram = () => {
  const canvasRef = useRef(null)
  const canvasInstance = useRef(null)
  const [drawingMode, setDrawingMode] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [gridSize, setGridSize] = useState(50)
  const gridGroupRef = useRef(null)
  const [shapesExpanded, setShapesExpanded] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedObject, setSelectedObject] = useState(null)
  const [textColor, setTextColor] = useState("#000000")
  const [textBgColor, setTextBgColor] = useState("transparent")
  const [textFontSize, setTextFontSize] = useState(20)
  const [textBold, setTextBold] = useState(false)
  const [textItalic, setTextItalic] = useState(false)
  const [textUnderline, setTextUnderline] = useState(false)
  const [objectDimensions, setObjectDimensions] = useState({ width: 0, height: 0 }) // Dimensions de l'objet sélectionné    

  // Définition des formes disponibles pour le panneau de formes
  const handleZoom = (delta) => {
    if (!canvasInstance.current) return;

    // Récupérer le niveau de zoom actuel
    let zoom = canvasInstance.current.getZoom();

    // Ajuster le niveau de zoom
    zoom += delta;

    // Limiter le niveau de zoom (par exemple, entre 0.1 et 3)
    zoom = Math.max(0.1, Math.min(3, zoom));

    // Appliquer le zoom au canvas
    canvasInstance.current.zoomToPoint(
      { x: canvasInstance.current.getWidth() / 2, y: canvasInstance.current.getHeight() / 2 },
      zoom
    );

    // Redessiner le canvas
    canvasInstance.current.requestRenderAll();
  };
  const floorPlanShapes = [
    // Première ligne
    { id: "wall-h", type: "line", props: { x1: 0, y1: 0, x2: 50, y2: 0, stroke: "#000", strokeWidth: 5 } },
    { id: "wall-v", type: "line", props: { x1: 0, y1: 0, x2: 0, y2: 50, stroke: "#000", strokeWidth: 5 } },
    {
      id: "corner-tl",
      type: "path",
      path: "M 0,50 L 0,0 L 50,0",
      props: { stroke: "#000", strokeWidth: 5, fill: "transparent" },
    },
    {
      id: "corner-tr",
      type: "path",
      path: "M 0,0 L 50,0 L 50,50",
      props: { stroke: "#000", strokeWidth: 5, fill: "transparent" },
    },
    {
      id: "corner-br",
      type: "path",
      path: "M 50,0 L 50,50 L 0,50",
      props: { stroke: "#000", strokeWidth: 5, fill: "transparent" },
    },

    // Deuxième ligne
    {
      id: "corner-bl",
      type: "path",
      path: "M 50,50 L 0,50 L 0,0",
      props: { stroke: "#000", strokeWidth: 5, fill: "transparent" },
    },
    { id: "room", type: "rect", props: { width: 50, height: 50, stroke: "#000", strokeWidth: 5, fill: "transparent" } },
    { id: "wall-h-short", type: "line", props: { x1: 0, y1: 0, x2: 30, y2: 0, stroke: "#000", strokeWidth: 5 } },
    { id: "wall-v-short", type: "line", props: { x1: 0, y1: 0, x2: 0, y2: 30, stroke: "#000", strokeWidth: 5 } },
    {
      id: "wall-h-dashed",
      type: "line",
      props: { x1: 0, y1: 0, x2: 50, y2: 0, stroke: "#000", strokeWidth: 3, strokeDashArray: [5, 5] },
    },

    // Troisième ligne
    {
      id: "door-arc",
      type: "path",
      path: "M 0,0 A 50,50 0 0,1 50,0",
      props: { stroke: "#000", strokeWidth: 2, fill: "transparent" },
    },
    { id: "window", type: "rect", props: { width: 50, height: 5, stroke: "#000", strokeWidth: 2, fill: "#87CEEB" } },
    {
      id: "window-double",
      type: "group",
      objects: [
        { type: "rect", props: { width: 50, height: 5, top: 0, stroke: "#000", strokeWidth: 2, fill: "#87CEEB" } },
        { type: "rect", props: { width: 50, height: 5, top: 15, stroke: "#000", strokeWidth: 2, fill: "#87CEEB" } },
      ],
    },
    {
      id: "table-rect",
      type: "rect",
      props: { width: 50, height: 30, stroke: "#000", strokeWidth: 2, fill: "#D2691E" },
    },
    { id: "shelf", type: "rect", props: { width: 50, height: 15, stroke: "#000", strokeWidth: 2, fill: "#FFD700" } },

    // Quatrième ligne
    {
      id: "quarter-circle-tl",
      type: "path",
      path: "M 0,0 L 50,0 C 50,27.6 27.6,50 0,50 Z",
      props: { stroke: "#000", strokeWidth: 2, fill: "transparent" },
    },
    {
      id: "quarter-circle-tr",
      type: "path",
      path: "M 0,0 L 50,0 L 50,50 C 22.4,50 0,27.6 0,0 Z",
      props: { stroke: "#000", strokeWidth: 2, fill: "transparent" },
    },
    {
      id: "glasses",
      type: "path",
      path: "M 0,25 C 0,10 50,10 50,25 C 50,40 0,40 0,25 Z",
      props: { stroke: "#000", strokeWidth: 2, fill: "transparent" },
    },
    { id: "desk", type: "rect", props: { width: 60, height: 30, stroke: "#000", strokeWidth: 2, fill: "#A0522D" } },
    { id: "cabinet", type: "rect", props: { width: 30, height: 50, stroke: "#000", strokeWidth: 2, fill: "#8B4513" } },

    // Cinquième ligne
    { id: "circle", type: "circle", props: { radius: 25, stroke: "#000", strokeWidth: 2, fill: "transparent" } },
    {
      id: "computer",
      type: "group",
      objects: [
        { type: "rect", props: { width: 40, height: 30, stroke: "#000", strokeWidth: 2, fill: "#708090" } },
        {
          type: "rect",
          props: { width: 20, height: 5, top: 35, left: 10, stroke: "#000", strokeWidth: 2, fill: "#708090" },
        },
      ],
    },
    { id: "chair", type: "circle", props: { radius: 15, stroke: "#000", strokeWidth: 2, fill: "#A9A9A9" } },
    {
      id: "square-table",
      type: "rect",
      props: { width: 40, height: 40, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" },
    },
    {
      id: "rectangle",
      type: "rect",
      props: { width: 50, height: 30, stroke: "#000", strokeWidth: 2, fill: "transparent" },
    },

    // Sixième ligne
    { id: "toilet", type: "ellipse", props: { rx: 15, ry: 25, stroke: "#000", strokeWidth: 2, fill: "#F5F5F5" } },
    { id: "sink", type: "circle", props: { radius: 15, stroke: "#000", strokeWidth: 2, fill: "#F5F5F5" } },
    {
      id: "bathtub",
      type: "rect",
      props: { width: 50, height: 25, rx: 10, ry: 10, stroke: "#000", strokeWidth: 2, fill: "#F5F5F5" },
    },
    { id: "shower", type: "rect", props: { width: 30, height: 30, stroke: "#000", strokeWidth: 2, fill: "#F5F5F5" } },
    { id: "fridge", type: "rect", props: { width: 25, height: 40, stroke: "#000", strokeWidth: 2, fill: "#B0C4DE" } },

    // Septième ligne
    {
      id: "square-small",
      type: "rect",
      props: { width: 20, height: 20, stroke: "#000", strokeWidth: 2, fill: "transparent" },
    },
    { id: "table-round", type: "circle", props: { radius: 20, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" } },
    { id: "table-oval", type: "ellipse", props: { rx: 25, ry: 15, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" } },
    {
      id: "table-rect-small",
      type: "rect",
      props: { width: 40, height: 20, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" },
    },
    {
      id: "table-rect-large",
      type: "rect",
      props: { width: 50, height: 25, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" },
    },

    // Huitième ligne
    { id: "ellipse", type: "ellipse", props: { rx: 25, ry: 15, stroke: "#000", strokeWidth: 2, fill: "transparent" } },
    {
      id: "table-round-4",
      type: "group",
      objects: [
        { type: "circle", props: { radius: 20, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" } },
        { type: "circle", props: { radius: 5, top: -25, left: 0, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 25, left: 0, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 0, left: -25, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 0, left: 25, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
      ],
    },
    {
      id: "table-rect-4",
      type: "group",
      objects: [
        { type: "rect", props: { width: 40, height: 40, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" } },
        { type: "circle", props: { radius: 5, top: -25, left: -25, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: -25, left: 25, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 25, left: -25, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 25, left: 25, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
      ],
    },
    {
      id: "table-oval-4",
      type: "group",
      objects: [
        { type: "ellipse", props: { rx: 25, ry: 15, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" } },
        { type: "circle", props: { radius: 5, top: -20, left: 0, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 20, left: 0, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 0, left: -30, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 5, top: 0, left: 30, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
      ],
    },
    {
      id: "table-rect-6",
      type: "group",
      objects: [
        { type: "rect", props: { width: 50, height: 30, stroke: "#000", strokeWidth: 2, fill: "#D2B48C" } },
        { type: "circle", props: { radius: 4, top: -15, left: -20, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 4, top: -15, left: 0, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 4, top: -15, left: 20, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 4, top: 15, left: -20, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 4, top: 15, left: 0, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
        { type: "circle", props: { radius: 4, top: 15, left: 20, stroke: "#000", strokeWidth: 1, fill: "#A9A9A9" } },
      ],
    },
  ]

  // Couleurs prédéfinies pour le texte
  const predefinedColors = [
    "#000000", // Noir
    "#FFFFFF", // Blanc
    "#FF0000", // Rouge
    "#00FF00", // Vert
    "#0000FF", // Bleu
    "#FFFF00", // Jaune
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Violet
    "#008000", // Vert foncé
    "#800000", // Marron
    "#808080", // Gris
  ]

  useEffect(() => {
    if (!canvasRef.current) return

    canvasInstance.current = new Canvas(canvasRef.current, {
      width: window.innerWidth - 260, // Ajusté pour le panneau de formes
      height: window.innerHeight - 20,
      backgroundColor: "#ffffff",
      selection: true,
    })
     // Ajouter un écouteur d'événement pour la molette de la souris
     canvasInstance.current.on("mouse:wheel", (opt) => {
        const delta = opt.e.deltaY; // Sens de la molette
        const zoomFactor = delta > 0 ? -0.1 : 0.1; // Ajuster le zoom en fonction de la direction
        handleZoom(zoomFactor);
        opt.e.preventDefault(); // Empêcher le défilement de la page
        opt.e.stopPropagation();
      });
      
    drawGrid(gridSize);

    const handleResize = () => {
      canvasInstance.current.setDimensions({
        width: window.innerWidth - 260, // Ajusté pour le panneau de formes
        height: window.innerHeight - 20,
      })
      drawGrid(gridSize)
    }

    window.addEventListener("resize", handleResize)
    drawGrid(gridSize)
    setupDrawingHandlers()

    return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []); // Added gridSize to dependencies

  const setupDrawingHandlers = () => {
    canvasInstance.current.on("mouse:down", handleMouseDown)
    canvasInstance.current.on("mouse:move", handleMouseMove)
    canvasInstance.current.on("mouse:up", handleMouseUp)

    // Gestion de la sélection d'objets
    canvasInstance.current.on("selection:created", handleObjectSelected)
    canvasInstance.current.on("selection:updated", handleObjectSelected)
    canvasInstance.current.on("selection:cleared", handleSelectionCleared)
  }

  const handleObjectSelected = (e) => {
    const selectedObj = e.selected[0]
    setSelectedObject(selectedObj)
// Mettre à jour les dimensions de l'objet sélectionné
if (selectedObj) {
    setObjectDimensions({
      width: Math.round(selectedObj.width * selectedObj.scaleX / gridSize),
      height: Math.round(selectedObj.height * selectedObj.scaleY / gridSize),
    })
  }
    // Si c'est un texte, mettre à jour les contrôles de texte
    if (selectedObj && selectedObj.type === "i-text") {
      setTextColor(selectedObj.fill)
      setTextBgColor(selectedObj.backgroundColor || "transparent")
      setTextFontSize(selectedObj.fontSize)
      setTextBold(selectedObj.fontWeight === "bold")
      setTextItalic(selectedObj.fontStyle === "italic")
      setTextUnderline(selectedObj.underline)
    }
  }

  const handleSelectionCleared = () => {
    setSelectedObject(null)
        setObjectDimensions({ width: 0, height: 0 }) // Réinitialiser les dimensions

  }
  const handleObjectModified = (e) => {
    const modifiedObj = e.target
    if (modifiedObj) {
      setObjectDimensions({
        width: Math.round(modifiedObj.width * modifiedObj.scaleX / gridSize),
        height: Math.round(modifiedObj.height * modifiedObj.scaleY / gridSize),
      })
    }
  }

  const handleMouseDown = (event) => {
    if (!drawingMode) return

    const pointer = canvasInstance.current.getPointer(event.e)
    setIsDrawing(true)
    setStartPoint({ x: pointer.x, y: pointer.y })

    switch (drawingMode) {
      case "line":
      case "dashedLine":
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: "#000",
          strokeWidth: 2,
          strokeDashArray: drawingMode === "dashedLine" ? [5, 5] : null,
        })
        canvasInstance.current.add(line)
        canvasInstance.current.setActiveObject(line)
        break
      case "circle":
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          fill: "transparent",
          stroke: "#000",
          strokeWidth: 2,
          originX: "center",
          originY: "center",
        })
        canvasInstance.current.add(circle)
        canvasInstance.current.setActiveObject(circle)
        break
      case "semicircle":
        const path = new Path("M 0 0 A 1 1 0 0 1 1 0 L 0 0 z", {
          left: pointer.x,
          top: pointer.y,
          fill: "transparent",
          stroke: "#000",
          strokeWidth: 2,
        })
        canvasInstance.current.add(path)
        canvasInstance.current.setActiveObject(path)
        break
      case "rectangle":
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 1,
          height: 1,
          fill: "transparent",
          stroke: "#000",
          strokeWidth: 2,
        })
        canvasInstance.current.add(rect)
        canvasInstance.current.setActiveObject(rect)
        break
      case "triangle":
        const triangle = new Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 1,
          height: 1,
          fill: "transparent",
          stroke: "#000",
          strokeWidth: 2,
        })
        canvasInstance.current.add(triangle)
        canvasInstance.current.setActiveObject(triangle)
        break
      case "text":
        const text = new IText("Texte", {
          left: pointer.x,
          top: pointer.y,
          fontSize: textFontSize,
          fill: textColor,
          backgroundColor: textBgColor !== "transparent" ? textBgColor : undefined,
          fontWeight: textBold ? "bold" : "normal",
          fontStyle: textItalic ? "italic" : "normal",
          underline: textUnderline,
          selectable: true,
          editable: true,
        })
        canvasInstance.current.add(text)
        canvasInstance.current.setActiveObject(text)
        text.enterEditing()
        text.selectAll()
        break
    }
  }

  const handleMouseMove = (event) => {
    if (!isDrawing || !drawingMode) return

    const pointer = canvasInstance.current.getPointer(event.e)
    const activeObject = canvasInstance.current.getActiveObject()

    if (!activeObject) return

    switch (drawingMode) {
      case "line":
      case "dashedLine":
        activeObject.set({
          x2: pointer.x,
          y2: pointer.y,
        })
        break
      case "circle":
        const radius = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2))
        activeObject.set({
          radius: radius,
        })
        break
      case "semicircle":
        const width = pointer.x - startPoint.x
        const height = pointer.y - startPoint.y
        const radius2 = Math.sqrt(width * width + height * height)
        const path = [
          "M",
          startPoint.x,
          startPoint.y,
          "A",
          radius2,
          radius2,
          0,
          0,
          1,
          startPoint.x + width,
          startPoint.y + height,
          "L",
          startPoint.x,
          startPoint.y,
          "z",
        ].join(" ")
        activeObject.set({
          path: path,
        })
        break
      case "rectangle":
        activeObject.set({
          width: Math.abs(pointer.x - startPoint.x),
          height: Math.abs(pointer.y - startPoint.y),
          left: Math.min(startPoint.x, pointer.x),
          top: Math.min(startPoint.y, pointer.y),
        })
        break
      case "triangle":
        activeObject.set({
          width: Math.abs(pointer.x - startPoint.x),
          height: Math.abs(pointer.y - startPoint.y),
          left: Math.min(startPoint.x, pointer.x),
          top: Math.min(startPoint.y, pointer.y),
        })
        break
    }

    canvasInstance.current.requestRenderAll()
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setStartPoint(null)
  }

  const drawGrid = (size) => {
    // Supprimer l'ancienne grille si elle existe
    canvasInstance.current.getObjects().forEach((obj) => {
      if (obj instanceof Group && obj.getObjects().every((line) => line instanceof Line)) {
        canvasInstance.current.remove(obj);
      }
    });
  
    // Si la grille n'est pas activée, ne rien faire
    if (!gridEnabled) {
      return;
    }
  
    const gridLines = [];
    const width = canvasInstance.current.getWidth();
    const height = canvasInstance.current.getHeight();
  
    // Lignes verticales
    for (let i = 0; i < width; i += size) {
      const line = new Line([i, 0, i, height], {
        stroke: '#ccc',
        selectable: false,
        evented: false,
      });
      gridLines.push(line);
    }
  
    // Lignes horizontales
    for (let j = 0; j < height; j += size) {
      const line = new Line([0, j, width, j], {
        stroke: '#ccc',
        selectable: false,
        evented: false,
      });
      gridLines.push(line);
    }
  
    // Créer le groupe de lignes
    const gridGroup = new Group(gridLines, {
      selectable: false,
      evented: false,
    });
  
    // Ajouter le groupe au canevas
    canvasInstance.current.add(gridGroup);
    
    // Envoyer le groupe à l'arrière-plan
    //canvasInstance.current.sendToBack(gridGroup);
  
    // Demander un rendu du canevas
    canvasInstance.current.requestRenderAll();
  };
    // Fonction pour mettre à jour la grille
    const updateGrid = (size) => {
        // Supprimer l'ancienne grille
        canvasInstance.current.getObjects().forEach((obj) => {
          if (obj instanceof Group && obj.getObjects().every((line) => line instanceof Line)) {
            canvasInstance.current.remove(obj);
          }
        });
    
        // Dessiner la nouvelle grille
        if (gridEnabled) {
          drawGrid(size);
        }
      };
  const toggleGrid = () => {
    setGridEnabled(!gridEnabled);
    if (!gridEnabled) {
      drawGrid(gridSize);
      updateGrid(gridSize);
    } else if (gridGroupRef.current) {
      canvasInstance.current.remove(gridGroupRef.current);
      gridGroupRef.current = null;
      canvasInstance.current.requestRenderAll();
    }
  };

  const increaseGridSize = () => {
    const newSize = gridSize + 10;
    setGridSize(newSize);
    drawGrid(newSize);
    updateGrid(newSize);
  };
  
  const decreaseGridSize = () => {
    const newSize = Math.max(10, gridSize - 10);
    setGridSize(newSize);
    drawGrid(newSize);
    updateGrid(newSize);
  };

  const updateTextStyle = () => {
    const activeObject = canvasInstance.current.getActiveObject()
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set({
        fill: textColor,
        backgroundColor: textBgColor !== "transparent" ? textBgColor : undefined,
        fontSize: textFontSize,
        fontWeight: textBold ? "bold" : "normal",
        fontStyle: textItalic ? "italic" : "normal",
        underline: textUnderline,
      })
      canvasInstance.current.requestRenderAll()
    }
  }

  const addWall = () => {
    const wall = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 20,
      fill: "#666",
      stroke: "#000",
      strokeWidth: 2,
    })
    canvasInstance.current.add(wall)
    canvasInstance.current.requestRenderAll()
  }

  const addDoor = () => {
    const doorRect = new Rect({
      width: 80,
      height: 10,
      fill: "#8B4513",
    })

    const doorArc = new Path("M 0 0 A 80 80 0 0 1 80 0", {
      fill: "transparent",
      stroke: "#8B4513",
      strokeWidth: 2,
    })

    const doorGroup = new Group([doorRect, doorArc], {
      left: 150,
      top: 150,
    })

    canvasInstance.current.add(doorGroup)
    canvasInstance.current.requestRenderAll()
  }

  const addWindow = () => {
    const windowGroup = new Group(
      [
        new Rect({
          width: 60,
          height: 5,
          fill: "#87CEEB",
        }),
        new Rect({
          width: 60,
          height: 5,
          top: 15,
          fill: "#87CEEB",
        }),
      ],
      {
        left: 200,
        top: 200,
      },
    )

    canvasInstance.current.add(windowGroup)
    canvasInstance.current.requestRenderAll()
  }

  const addTable = () => {
    const tableRect = new Rect({
      width: 120,
      height: 60,
      fill: "transparent",
      stroke: "#000",
      strokeWidth: 2,
    })

    const tableSymbol = new Rect({
      width: 100,
      height: 40,
      left: 10,
      top: 10,
      fill: "#D2691E",
      stroke: "#000",
      strokeWidth: 1,
    })

    const tableGroup = new Group([tableRect, tableSymbol], {
      left: 300,
      top: 300,
    })

    canvasInstance.current.add(tableGroup)
    canvasInstance.current.requestRenderAll()
  }

  const addDisplay = () => {
    const displayBase = new Rect({
      width: 100,
      height: 40,
      fill: "#FFD700",
      stroke: "#000",
      strokeWidth: 2,
    })

    const shelves = []
    for (let i = 0; i < 3; i++) {
      shelves.push(
        new Line([0, i * 10, 100, i * 10], {
          stroke: "#000",
          strokeWidth: 1,
        }),
      )
    }

    const displayGroup = new Group([displayBase, ...shelves], {
      left: 400,
      top: 400,
    })

    canvasInstance.current.add(displayGroup)
    canvasInstance.current.requestRenderAll()
  }

  const addText = () => {
    setDrawingMode("text")
  }

  // Fonction pour ajouter une forme du panneau au canvas
  const addShapeToCanvas = (shape) => {
    let fabricObject

    switch (shape.type) {
      case "line":
        fabricObject = new Line([shape.props.x1, shape.props.y1, shape.props.x2, shape.props.y2], {
          ...shape.props,
        })
        break
      case "rect":
        fabricObject = new Rect({ ...shape.props })
        break
      case "circle":
        fabricObject = new Circle({ ...shape.props })
        break
      case "ellipse":
        fabricObject = new Ellipse({ ...shape.props })
        break
      case "triangle":
        fabricObject = new Triangle({ ...shape.props })
        break
      case "path":
        fabricObject = new Path(shape.path, { ...shape.props })
        break
      case "group":
        const objects = shape.objects
          .map((obj) => {
            switch (obj.type) {
              case "rect":
                return new Rect({ ...obj.props })
              case "circle":
                return new Circle({ ...obj.props })
              case "ellipse":
                return new Ellipse({ ...obj.props })
              case "line":
                return new Line([obj.props.x1, obj.props.y1, obj.props.x2, obj.props.y2], { ...obj.props })
              case "path":
                return new Path(obj.path, { ...obj.props })
              default:
                return null
            }
          })
          .filter(Boolean)

        fabricObject = new Group(objects)
        break
      default:
        return
    }

    if (fabricObject) {
      fabricObject.set({
        left: 200,
        top: 200,
        originX: "center",
        originY: "center",
      })

      canvasInstance.current.add(fabricObject)
      canvasInstance.current.setActiveObject(fabricObject)
      canvasInstance.current.requestRenderAll()
    }
  }

  const filteredShapes = floorPlanShapes.filter((shape) => shape.id.toLowerCase().includes(searchTerm.toLowerCase()))

  const toolbarStyle = {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "60px",
    backgroundColor: "#1a1a1a",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1000,
  }

  const toolButtonStyle = {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    padding: "8px",
  }

  const shapesPanelStyle = {
    position: "fixed",
    left: "60px",
    top: 0,
    bottom: 0,
    width: "200px",
    backgroundColor: "#f0f0f0",
    borderRight: "1px solid #ccc",
    overflowY: "auto",
    zIndex: 999,
  }

  const searchBoxStyle = {
    padding: "10px",
    position: "sticky",
    top: 0,
    backgroundColor: "#f0f0f0",
    borderBottom: "1px solid #ddd",
    zIndex: 1,
  }

  const searchInputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  }

  const categoryHeaderStyle = {
    padding: "10px",
    backgroundColor: "#e0e0e0",
    borderBottom: "1px solid #ccc",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  }

  const shapesGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "5px",
    padding: "10px",
  }

  const shapeItemStyle = {
    width: "100%",
    aspectRatio: "1/1",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "2px",
  }

  const gridControlsStyle = {
    position: "fixed",
    right: "20px",
    top: "20px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1000,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  }

  const textControlsStyle = {
    position: "fixed",
    right: "20px",
    top: "120px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    display: selectedObject && selectedObject.type === "i-text" ? "flex" : "none",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1000,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "250px",
  }

  const colorGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "5px",
    marginTop: "5px",
  }

  const colorButtonStyle = (color) => ({
    width: "100%",
    aspectRatio: "1/1",
    backgroundColor: color,
    border: `1px solid ${color === "#FFFFFF" ? "#ccc" : color}`,
    borderRadius: "4px",
    cursor: "pointer",
  })

  const fontSizeControlStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }

  const fontStyleControlStyle = {
    display: "flex",
    gap: "5px",
  }

  // Fonction pour rendre une miniature de forme
  const renderShapeThumbnail = (shape) => {
    switch (shape.type) {
      case "line":
        if (shape.id.includes("wall-h")) {
          return <div style={{ width: "80%", height: "4px", backgroundColor: "black" }} />
        } else if (shape.id.includes("wall-v")) {
          return <div style={{ width: "4px", height: "80%", backgroundColor: "black" }} />
        } else if (shape.id.includes("dashed")) {
          return (
            <div
              style={{
                width: "80%",
                height: "2px",
                backgroundImage: "linear-gradient(to right, black 50%, transparent 50%)",
                backgroundSize: "8px 100%",
              }}
            />
          )
        }
        return <div style={{ width: "80%", height: "2px", backgroundColor: "black" }} />

      case "rect":
        if (shape.id.includes("window")) {
          return <div style={{ width: "80%", height: "20%", backgroundColor: "#87CEEB", border: "1px solid black" }} />
        } else if (shape.id.includes("table")) {
          return <div style={{ width: "80%", height: "60%", backgroundColor: "#D2691E", border: "1px solid black" }} />
        } else if (shape.id.includes("desk")) {
          return <div style={{ width: "80%", height: "50%", backgroundColor: "#A0522D", border: "1px solid black" }} />
        } else if (shape.id.includes("cabinet")) {
          return <div style={{ width: "60%", height: "80%", backgroundColor: "#8B4513", border: "1px solid black" }} />
        } else if (shape.id.includes("shelf")) {
          return <div style={{ width: "80%", height: "30%", backgroundColor: "#FFD700", border: "1px solid black" }} />
        } else if (shape.id.includes("shower") || shape.id.includes("bathtub")) {
          return <div style={{ width: "70%", height: "60%", backgroundColor: "#F5F5F5", border: "1px solid black" }} />
        } else if (shape.id.includes("fridge")) {
          return <div style={{ width: "50%", height: "80%", backgroundColor: "#B0C4DE", border: "1px solid black" }} />
        } else if (shape.id.includes("room")) {
          return (
            <div
              style={{
                width: "80%",
                height: "80%",
                border: "3px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "70%", height: "70%", backgroundColor: "#f8f8f8" }} />
            </div>
          )
        }
        return <div style={{ width: "80%", height: "80%", border: "2px solid black" }} />

      case "circle":
        if (shape.id.includes("chair")) {
          return (
            <div
              style={{
                width: "60%",
                height: "60%",
                borderRadius: "50%",
                backgroundColor: "#A9A9A9",
                border: "1px solid black",
              }}
            />
          )
        } else if (shape.id.includes("sink")) {
          return (
            <div
              style={{
                width: "60%",
                height: "60%",
                borderRadius: "50%",
                backgroundColor: "#F5F5F5",
                border: "1px solid black",
              }}
            />
          )
        } else if (shape.id.includes("table-round")) {
          return (
            <div
              style={{
                width: "70%",
                height: "70%",
                borderRadius: "50%",
                backgroundColor: "#D2B48C",
                border: "1px solid black",
              }}
            />
          )
        }
        return <div style={{ width: "70%", height: "70%", borderRadius: "50%", border: "2px solid black" }} />

      case "ellipse":
        if (shape.id.includes("toilet")) {
          return (
            <div
              style={{
                width: "60%",
                height: "80%",
                borderRadius: "50%",
                backgroundColor: "#F5F5F5",
                border: "1px solid black",
              }}
            />
          )
        } else if (shape.id.includes("table-oval")) {
          return (
            <div
              style={{
                width: "80%",
                height: "60%",
                borderRadius: "50%",
                backgroundColor: "#D2B48C",
                border: "1px solid black",
              }}
            />
          )
        }
        return <div style={{ width: "80%", height: "60%", borderRadius: "50%", border: "2px solid black" }} />

      case "path":
        if (shape.id.includes("corner")) {
          if (shape.id.includes("tl")) {
            return (
              <div style={{ width: "80%", height: "80%", position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "50%",
                    height: "3px",
                    backgroundColor: "black",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "3px",
                    height: "50%",
                    backgroundColor: "black",
                  }}
                />
              </div>
            )
          } else if (shape.id.includes("tr")) {
            return (
              <div style={{ width: "80%", height: "80%", position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "50%",
                    height: "3px",
                    backgroundColor: "black",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "3px",
                    height: "50%",
                    backgroundColor: "black",
                  }}
                />
              </div>
            )
          } else if (shape.id.includes("br")) {
            return (
              <div style={{ width: "80%", height: "80%", position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "50%",
                    height: "3px",
                    backgroundColor: "black",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "3px",
                    height: "50%",
                    backgroundColor: "black",
                  }}
                />
              </div>
            )
          } else if (shape.id.includes("bl")) {
            return (
              <div style={{ width: "80%", height: "80%", position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "50%",
                    height: "3px",
                    backgroundColor: "black",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "3px",
                    height: "50%",
                    backgroundColor: "black",
                  }}
                />
              </div>
            )
          }
        } else if (shape.id.includes("quarter-circle")) {
          if (shape.id.includes("tl")) {
            return (
              <div style={{ width: "80%", height: "80%", position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderTopLeftRadius: "0%",
                    borderTopRightRadius: "100%",
                    borderBottomRightRadius: "0%",
                    borderBottomLeftRadius: "0%",
                    border: "2px solid black",
                    borderRight: "none",
                    borderBottom: "none",
                  }}
                />
              </div>
            )
          } else if (shape.id.includes("tr")) {
            return (
              <div style={{ width: "80%", height: "80%", position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderTopLeftRadius: "100%",
                    borderTopRightRadius: "0%",
                    borderBottomRightRadius: "0%",
                    borderBottomLeftRadius: "0%",
                    border: "2px solid black",
                    borderLeft: "none",
                    borderBottom: "none",
                  }}
                />
              </div>
            )
          }
        } else if (shape.id.includes("door-arc")) {
          return (
            <div
              style={{
                width: "80%",
                height: "40%",
                borderTop: "2px solid black",
                borderTopLeftRadius: "40px",
                borderTopRightRadius: "40px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "40%",
                  width: "20%",
                  height: "3px",
                  backgroundColor: "#8B4513",
                }}
              />
            </div>
          )
        } else if (shape.id.includes("glasses")) {
          return (
            <div
              style={{
                width: "80%",
                height: "40%",
                border: "2px solid black",
                borderRadius: "50% / 100%",
                borderTopLeftRadius: "0",
                borderTopRightRadius: "0",
              }}
            />
          )
        }
        return <FaDrawPolygon size={20} />

      case "group":
        if (shape.id.includes("table-round-4")) {
          return (
            <div style={{ position: "relative", width: "80%", height: "80%" }}>
              <div
                style={{
                  width: "70%",
                  height: "70%",
                  borderRadius: "50%",
                  backgroundColor: "#D2B48C",
                  border: "1px solid black",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10%",
                  transform: "translateY(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10%",
                  transform: "translateY(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
            </div>
          )
        } else if (shape.id.includes("table-rect-4")) {
          return (
            <div style={{ position: "relative", width: "80%", height: "80%" }}>
              <div
                style={{
                  width: "80%",
                  height: "80%",
                  backgroundColor: "#D2B48C",
                  border: "1px solid black",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "15%",
                  left: "15%",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "15%",
                  right: "15%",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "15%",
                  left: "15%",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "15%",
                  right: "15%",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
            </div>
          )
        } else if (shape.id.includes("table-oval-4")) {
          return (
            <div style={{ position: "relative", width: "80%", height: "80%" }}>
              <div
                style={{
                  width: "90%",
                  height: "60%",
                  borderRadius: "50%",
                  backgroundColor: "#D2B48C",
                  border: "1px solid black",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10%",
                  transform: "translateY(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10%",
                  transform: "translateY(-50%)",
                  width: "15%",
                  height: "15%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
            </div>
          )
        } else if (shape.id.includes("table-rect-6")) {
          return (
            <div style={{ position: "relative", width: "80%", height: "80%" }}>
              <div
                style={{
                  width: "90%",
                  height: "60%",
                  backgroundColor: "#D2B48C",
                  border: "1px solid black",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: "20%",
                  width: "12%",
                  height: "12%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "12%",
                  height: "12%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  right: "20%",
                  width: "12%",
                  height: "12%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "25%",
                  left: "20%",
                  width: "12%",
                  height: "12%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "25%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "12%",
                  height: "12%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "25%",
                  right: "20%",
                  width: "12%",
                  height: "12%",
                  borderRadius: "50%",
                  backgroundColor: "#A9A9A9",
                }}
              />
            </div>
          )
        } else if (shape.id.includes("window-double")) {
          return (
            <div style={{ position: "relative", width: "80%", height: "80%" }}>
              <div
                style={{
                  width: "90%",
                  height: "20%",
                  backgroundColor: "#87CEEB",
                  border: "1px solid black",
                  position: "absolute",
                  top: "30%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                style={{
                  width: "90%",
                  height: "20%",
                  backgroundColor: "#87CEEB",
                  border: "1px solid black",
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          )
        } else if (shape.id.includes("computer")) {
          return (
            <div style={{ position: "relative", width: "80%", height: "80%" }}>
              <div
                style={{
                  width: "80%",
                  height: "60%",
                  backgroundColor: "#708090",
                  border: "1px solid black",
                  position: "absolute",
                  top: "30%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <div
                style={{
                  width: "40%",
                  height: "10%",
                  backgroundColor: "#708090",
                  border: "1px solid black",
                  position: "absolute",
                  bottom: "20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          )
        }
        return <FaTable size={20} />

      case "triangle":
        return (
          <div
            style={{
              width: "0",
              height: "0",
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderBottom: "30px solid black",
            }}
          />
        )

      default:
        return <div style={{ width: "80%", height: "80%", border: "2px solid black" }} />
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <div style={toolbarStyle}>
      <button
          style={toolButtonStyle}
          onClick={() => handleZoom(0.1)} // Zoom in
          title="Zoomer"
        >
          <FaPlus />
        </button>
        <button
          style={toolButtonStyle}
          onClick={() => handleZoom(-0.1)} // Zoom out
          title="Dézoomer"
        >
          <FaMinus />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === null ? "#4a5568" : "#333" }}
          onClick={() => setDrawingMode(null)}
          title="Sélectionner"
        >
          <FaMousePointer />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "line" ? "#4a5568" : "#333" }}
          onClick={() => setDrawingMode("line")}
          title="Ligne"
        >
          <FaSlash />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "dashedLine" ? "#4a5568" : "#333" }}
          onClick={() => setDrawingMode("dashedLine")}
          title="Ligne pointillée"
        >
          <FaRuler />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "circle" ? "#4a5568" : "#333" }}
          onClick={() => setDrawingMode("circle")}
          title="Cercle"
        >
          <FaCircle />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "semicircle" ? "#4a5568" : "#333" }}
          onClick={() => setDrawingMode("semicircle")}
          title="Demi-cercle"
        >
          <FaCircle />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "rectangle" ? "#4a5568" : "#333" }}
          onClick={() => setDrawingMode("rectangle")}
          title="Rectangle"
        >
          <FaSquare />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "triangle" ? "#4a5568" : "#333" }}
          onClick={() => setDrawingMode("triangle")}
          title="Triangle"
        >
          <FaDrawPolygon />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "text" ? "#4a5568" : "#333" }}
          onClick={addText}
          title="Texte"
        >
          <FaFont />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "wall" ? "#4a5568" : "#333" }}
          onClick={addWall}
          title="Mur"
        >
          <FaHome />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "door" ? "#4a5568" : "#333" }}
          onClick={addDoor}
          title="Porte"
        >
          <FaDoorOpen />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "window" ? "#4a5568" : "#333" }}
          onClick={addWindow}
          title="Fenêtre"
        >
          <FaWindowMaximize />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "table" ? "#4a5568" : "#333" }}
          onClick={addTable}
          title="Table"
        >
          <FaTable />
        </button>
        <button
          style={{ ...toolButtonStyle, backgroundColor: drawingMode === "display" ? "#4a5568" : "#333" }}
          onClick={addDisplay}
          title="Présentoir"
        >
          <FaBoxOpen />
        </button>
        <div style={{ flexGrow: 1 }} />
        <button
          style={toolButtonStyle}
          onClick={() => canvasInstance.current.remove(canvasInstance.current.getActiveObject())}
          title="Supprimer"
        >
          <FaTrash />
        </button>
        <button
          style={toolButtonStyle}
          onClick={() => {
            const json = canvasInstance.current.toJSON()
            const blob = new Blob([JSON.stringify(json)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "planogram.json"
            link.click()
            URL.revokeObjectURL(url)
          }}
          title="Sauvegarder"
        >
          <FaSave />
        </button>
      </div>

      {/* Panneau de formes */}
      <div style={shapesPanelStyle}>
        <div style={searchBoxStyle}>
          <input
            type="text"
            placeholder="Search Shapes"
            style={searchInputStyle}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={categoryHeaderStyle} onClick={() => setShapesExpanded(!shapesExpanded)}>
          <span>Floor Plan</span>
          {shapesExpanded ? <FaChevronDown /> : <FaChevronRight />}
        </div>
        {shapesExpanded && (
          <div style={shapesGridStyle}>
            {filteredShapes.map((shape) => (
              <div key={shape.id} style={shapeItemStyle} onClick={() => addShapeToCanvas(shape)} title={shape.id}>
                {renderShapeThumbnail(shape)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contrôles de la grille */}
      <div style={gridControlsStyle}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Contrôles de la grille</div>
        <button
          style={{ ...toolButtonStyle, backgroundColor: gridEnabled ? "#4a5568" : "#333" }}
          onClick={toggleGrid}
          title={gridEnabled ? "Désactiver la grille" : "Activer la grille"}
        >
          {gridEnabled ? <FaEye /> : <FaEyeSlash />}
        </button>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            style={toolButtonStyle}
            onClick={decreaseGridSize}
            title="Diminuer la taille de la grille"
            disabled={gridSize <= 10}
          >
            <FaMinus />
          </button>
          <button style={toolButtonStyle} onClick={increaseGridSize} title="Augmenter la taille de la grille">
            <FaPlus />
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: "12px" }}>Taille: {gridSize}px</div>
      </div>
 {/* Affichage des dimensions de l'objet sélectionné */}
 {selectedObject && (
        <div style={{
          position: "fixed",
          right: "20px",
          top: "220px",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          zIndex: 1000,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Dimensions</div>
          <div>Largeur: {objectDimensions.width} unités</div>
          <div>Hauteur: {objectDimensions.height} unités</div>
        </div>
      )}

      {/* Contrôles du texte */}
      <div style={textControlsStyle}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Propriétés du texte</div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Couleur du texte:</label>
          <div style={colorGridStyle}>
            {predefinedColors.map((color) => (
              <button
                key={color}
                style={{
                  ...colorButtonStyle(color),
                  border: color === textColor ? "2px solid #000" : `1px solid ${color === "#FFFFFF" ? "#ccc" : color}`,
                }}
                onClick={() => {
                  setTextColor(color)
                  updateTextStyle()
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Couleur de fond:</label>
          <div style={colorGridStyle}>
            <button
              style={{
                ...colorButtonStyle("transparent"),
                backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)",
                backgroundSize: "10px 10px",
                border: textBgColor === "transparent" ? "2px solid #000" : "1px solid #ccc",
              }}
              onClick={() => {
                setTextBgColor("transparent")
                updateTextStyle()
              }}
              title="Transparent"
            />
            {predefinedColors.slice(0, 9).map((color) => (
              <button
                key={color}
                style={{
                  ...colorButtonStyle(color),
                  border:
                    color === textBgColor ? "2px solid #000" : `1px solid ${color === "#FFFFFF" ? "#ccc" : color}`,
                }}
                onClick={() => {
                  setTextBgColor(color)
                  updateTextStyle()
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div style={fontSizeControlStyle}>
          <label>Taille:</label>
          <button
            style={toolButtonStyle}
            onClick={() => {
              const newSize = Math.max(8, textFontSize - 2)
              setTextFontSize(newSize)
              updateTextStyle()
            }}
            title="Diminuer la taille"
          >
            <FaMinus />
          </button>
          <span style={{ minWidth: "30px", textAlign: "center" }}>{textFontSize}</span>
          <button
            style={toolButtonStyle}
            onClick={() => {
              const newSize = Math.min(72, textFontSize + 2)
              setTextFontSize(newSize)
              updateTextStyle()
            }}
            title="Augmenter la taille"
          >
            <FaPlus />
          </button>
        </div>

        <div style={fontStyleControlStyle}>
          <button
            style={{ ...toolButtonStyle, backgroundColor: textBold ? "#4a5568" : "#333" }}
            onClick={() => {
              setTextBold(!textBold)
              updateTextStyle()
            }}
            title="Gras"
          >
            <FaBold />
          </button>
          <button
            style={{ ...toolButtonStyle, backgroundColor: textItalic ? "#4a5568" : "#333" }}
            onClick={() => {
              setTextItalic(!textItalic)
              updateTextStyle()
            }}
            title="Italique"
          >
            <FaItalic />
          </button>
          <button
            style={{ ...toolButtonStyle, backgroundColor: textUnderline ? "#4a5568" : "#333" }}
            onClick={() => {
              setTextUnderline(!textUnderline)
              updateTextStyle()
            }}
            title="Souligné"
          >
            <FaUnderline />
          </button>
        </div>
      </div>

      <div style={{ marginLeft: "260px", height: "100vh" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export default Planogram