import * as THREE from "three"

export const createTransparentTexture = (imageUrl: string) => {
  return new Promise<THREE.Texture>((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      ctx?.drawImage(img, 0, 0)

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (!imageData) {
        reject(new Error("Failed to get image data"))
        return
      }

      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        const brightness = r * 0.299 + g * 0.587 + b * 0.114

        if (brightness > 230 && r > 220 && g > 220 && b > 220) {
          data[i + 3] = 0
        }
      }

      ctx?.putImageData(imageData, 0, 0)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      resolve(texture)
    }

    img.onerror = (err) => {
      console.error("Erreur lors du chargement de l'image:", err)
      reject(err)
    }

    img.src = imageUrl
  })
}
