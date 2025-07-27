"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"

interface SceneCaptureProps {
  onCapture: (dataUrl: string) => void
}

export const SceneCapture = ({ onCapture }: SceneCaptureProps) => {
  const { gl, scene, camera } = useThree()

  useEffect(() => {
    const handleCapture = () => {
      try {
        gl.render(scene, camera)

        const canvas = gl.domElement
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height

        const ctx = tempCanvas.getContext("2d")
        if (!ctx) {
          throw new Error("Impossible d'obtenir le contexte 2D")
        }

        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

        ctx.drawImage(canvas, 0, 0)

        const dataUrl = tempCanvas.toDataURL("image/png")
        onCapture(dataUrl)
      } catch (error) {
        console.error("Error capturing scene:", error)
        onCapture(null)
      }
    }

    const timeoutId = setTimeout(handleCapture, 500)

    return () => clearTimeout(timeoutId)
  }, [gl, scene, camera, onCapture])

  return null
}
