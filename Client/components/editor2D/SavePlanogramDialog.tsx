"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Save, Image as ImageIcon, Box as BoxIcon, FileText as FileTextIcon } from "lucide-react"

interface SavePlanogramDialogProps {
  planogramConfig: any
  cells: any[]
  products: any[]
  productInstances: any[]
  onSave: (name: string, description: string, files: {
    image2DUrl: string
    image3DUrl: string
    pdfUrl: string
  }) => void
  viewMode: "2D" | "3D"
  setViewMode: (mode: "2D" | "3D") => void
  captureSceneRef: React.RefObject<any>
  planogram2DRef: React.RefObject<HTMLDivElement>
  planogram3DRef: React.RefObject<HTMLDivElement>
}

export function SavePlanogramDialog({
  planogramConfig,
  cells,
  products,
  productInstances,
  onSave,
  viewMode,
  setViewMode,
  captureSceneRef,
  planogram2DRef,
  planogram3DRef,
}: SavePlanogramDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const [name, setName] = useState(planogramConfig.name)
  const [description, setDescription] = useState("")
  const { toast } = useToast()
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Stockage des URLs des fichiers
  const [image2DUrl, setImage2DUrl] = useState("")
  const [image3DUrl, setImage3DUrl] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const generate2DImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!planogram2DRef.current) {
        reject(new Error("2D element not found"))
        return
      }

      html2canvas(planogram2DRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      }).then((canvas) => {
        resolve(canvas.toDataURL("image/png"))
      }).catch(reject)
    })
  }

  const generate3DImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!captureSceneRef.current) {
        reject(new Error("3D capture not available"))
        return
      }

      captureSceneRef.current((dataUrl: string) => {
        if (!dataUrl) {
          reject(new Error("Failed to capture 3D scene"))
          return
        }
        resolve(dataUrl)
      })
    })
  }

  const generatePDF = async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm"
        })

        // Couverture
        doc.setFont("helvetica", "bold")
        doc.setFontSize(20)
        doc.text("Planogramme", 105, 30, { align: "center" })
        doc.setFontSize(16)
        doc.text(name, 105, 40, { align: "center" })
        doc.setFontSize(12)
        doc.text(`Généré le ${new Date().toLocaleDateString()}`, 105, 50, { align: "center" })

        // Ajouter l'image 2D
        try {
          const image2D = await generate2DImage()
          doc.addPage()
          doc.text("Vue 2D", 10, 10)
          const imgWidth = 190 // Largeur maximale pour A4
          const imgHeight = (imgWidth * 9) / 16 // Ratio 16:9
          doc.addImage(image2D, 'PNG', 10, 20, imgWidth, imgHeight)
        } catch (e) {
          console.warn("Failed to add 2D image to PDF:", e)
        }

        // Ajouter l'image 3D
        try {
          const image3D = await generate3DImage()
          doc.addPage()
          doc.text("Vue 3D", 10, 10)
          const imgWidth = 190
          const imgHeight = (imgWidth * 9) / 16
          doc.addImage(image3D, 'PNG', 10, 20, imgWidth, imgHeight)
        } catch (e) {
          console.warn("Failed to add 3D image to PDF:", e)
        }

        // Détails des produits
        doc.addPage()
        doc.text("Détail des produits", 10, 10)
        let yPos = 20
        const cellWidth = 40
        const headers = ["Produit", "Code", "Quantité", "Position", "Face"]
        
        cells.filter(cell => cell.instanceId).forEach((cell, index) => {
          if (yPos > 250) {
            doc.addPage()
            yPos = 20
          }
          
          const product = products.find(p => p.primary_id === 
            productInstances.find(pi => pi.instanceId === cell.instanceId)?.productId)
          
          if (product) {
            doc.text(`${product.name} (${product.primary_id})`, 10, yPos)
            doc.text(`Quantité: ${cell.quantity || 1}`, 10, yPos + 5)
            doc.text(`Position: E${cell.y + 1}C${cell.x + 1}`, 10, yPos + 10)
            doc.text(`Face: ${cell.face || 'front'}`, 10, yPos + 15)
            yPos += 20
          }
        })

        const pdfBlob = doc.output("blob")
        const pdfUrl = URL.createObjectURL(pdfBlob)
        resolve(pdfUrl)
      } catch (error) {
        reject(error)
      }
    })
  }

  const uploadFile = async (file: File, fileName: string): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file, fileName)
    
    try {
      const response = await fetch(`${API_BASE_URL}/planogram/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.filePath
    } catch (error) {
      console.error("Upload error:", error)
      throw error
    }
  }

  const generateAndUploadFiles = async () => {
    setIsGeneratingFiles(true)
    const originalViewMode = viewMode
    
    try {
      // Générer et uploader les fichiers
      const files = {
        image2DUrl: "",
        image3DUrl: "",
        pdfUrl: ""
      }

      // Vue 2D
      setViewMode("2D")
      await new Promise(resolve => setTimeout(resolve, 500))
      try {
        const image2D = await generate2DImage()
        const blob2D = await fetch(image2D).then(r => r.blob())
        const file2D = new File([blob2D], `${name.replace(/\s+/g, '_')}_2D.png`, { type: "image/png" })
        files.image2DUrl = await uploadFile(file2D, file2D.name)
        setImage2DUrl(files.image2DUrl)
      } catch (e) {
        console.warn("Failed to generate/upload 2D image:", e)
      }

      // Vue 3D
      setViewMode("3D")
      await new Promise(resolve => setTimeout(resolve, 1000))
      try {
        const image3D = await generate3DImage()
        const blob3D = await fetch(image3D).then(r => r.blob())
        const file3D = new File([blob3D], `${name.replace(/\s+/g, '_')}_3D.png`, { type: "image/png" })
        files.image3DUrl = await uploadFile(file3D, file3D.name)
        setImage3DUrl(files.image3DUrl)
      } catch (e) {
        console.warn("Failed to generate/upload 3D image:", e)
      }

      // PDF
      try {
        const pdfUrl = await generatePDF()
        const blobPDF = await fetch(pdfUrl).then(r => r.blob())
        const filePDF = new File([blobPDF], `${name.replace(/\s+/g, '_')}_planogram.pdf`, { type: "application/pdf" })
        files.pdfUrl = await uploadFile(filePDF, filePDF.name)
        setPdfUrl(files.pdfUrl)
      } catch (e) {
        console.warn("Failed to generate/upload PDF:", e)
      }

      return files
    } finally {
      setViewMode(originalViewMode)
      setIsGeneratingFiles(false)
    }
  }

  const handleSave = async () => {
    if (!name) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour le planogramme",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const files = await generateAndUploadFiles()
      onSave(name, description, files)
      
      toast({
        title: "Succès",
        description: "Le planogramme a été enregistré avec succès",
        variant: "default",
      })
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          {t("save")}
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[500px] ${isRTL ? "text-right rtl" : ""}`}>
        <DialogHeader>
          <DialogTitle>{t("savePlanogram")}</DialogTitle>
          <DialogDescription>
            {t("savePlanogramDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("name")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder={t("enterPlanogramName")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("description")}</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder={t("enterDescription")}
            />
          </div>

          {(image2DUrl || image3DUrl || pdfUrl) && (
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-2">{t("generatedFiles")}</h3>
              <div className="flex flex-wrap gap-2">
                {image2DUrl && (
                  <a 
                    href={`${BASE_URL}/${image2DUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Vue 2D
                  </a>
                )}
                {image3DUrl && (
                  <a 
                    href={`${BASE_URL}/${image3DUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <BoxIcon className="h-3 w-3 mr-1" />
                    Vue 3D
                  </a>
                )}
                {pdfUrl && (
                  <a 
                    href={`${BASE_URL}/${pdfUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <FileTextIcon className="h-3 w-3 mr-1" />
                    Fiche technique
                  </a>
                )}
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className={isRTL ? "justify-start" : "justify-end"}>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={isLoading || isGeneratingFiles}
          >
            {isGeneratingFiles ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("generatingFiles")}
              </>
            ) : isLoading ? (
              t("saving")
            ) : (
              t("save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}