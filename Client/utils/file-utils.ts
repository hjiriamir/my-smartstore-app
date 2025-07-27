const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const generateFileName = (baseName: string, suffix: string, extension: string) => {
  const cleanBase = (baseName || "planogram").replace(/[^a-z0-9]/gi, "_").toLowerCase()
  return `${cleanBase}_${suffix}.${extension}`
}

export const uploadFile = async (file: File, fileName: string, filesBaseName: string): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file, generateFileName(filesBaseName, fileName.split("-")[0], fileName.split(".")[1]))

  try {
    const response = await fetch(`${API_BASE_URL}/furniture/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.filePath
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    // Retirer l'utilisation de toast ici car elle ne peut pas être utilisée dans une fonction utilitaire
    // Le toast sera géré dans le composant qui appelle cette fonction
    throw error
  }
}
