"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Map, FileText } from "lucide-react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import type { FloorPlan } from "@/lib/types1"

interface FloorPlanSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPlan: (plan: FloorPlan) => void
  floorPlans: FloorPlan[]
  isMobile?: boolean
}

export const FloorPlanSelector = ({
  open,
  onOpenChange,
  onSelectPlan,
  floorPlans,
  isMobile = false,
}: FloorPlanSelectorProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobile ? "w-[95vw] max-w-[95vw] h-[90vh]" : "sm:max-w-[700px]"}`}
        dir={textDirection}
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center space-x-2 ${isMobile ? "text-base" : ""}`}>
            <Map className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
            <span>Sélectionner un plan d'étage</span>
          </DialogTitle>
          <DialogDescription className={isMobile ? "text-sm" : ""}>
            Choisissez un plan d'étage pour votre magasin. Seuls les meubles correspondant aux éléments du plan pourront
            être placés.
          </DialogDescription>
        </DialogHeader>
        <div className={`grid gap-4 ${isMobile ? "py-2" : "py-4"}`}>
          {floorPlans.length > 0 ? (
            <ScrollArea className={`w-full ${isMobile ? "h-[60vh]" : "h-[400px]"}`}>
              <div className={`grid gap-4 ${isMobile ? "pr-2" : "pr-4"}`}>
                {floorPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectPlan(plan)}
                  >
                    <CardContent className={isMobile ? "p-3" : "p-4"}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`bg-blue-100 rounded-md ${isMobile ? "p-1" : "p-2"}`}>
                            <FileText className={`text-blue-600 ${isMobile ? "h-4 w-4" : "h-6 w-6"}`} />
                          </div>
                          <div>
                            <h3 className={`font-medium ${isMobile ? "text-sm" : ""}`}>{plan.name}</h3>
                            <div className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
                              Mis à jour: {new Date(plan.updatedAt || Date.now()).toLocaleDateString()}
                            </div>
                            <div className={`text-muted-foreground mt-1 ${isMobile ? "text-xs" : "text-xs"}`}>
                              {plan.elements?.length || 0} éléments • {plan.elements?.filter((e) => e.name).length || 0}{" "}
                              nommés
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size={isMobile ? "sm" : "sm"}>
                          Sélectionner
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className={`text-center text-muted-foreground ${isMobile ? "py-4" : "py-8"}`}>
              Aucun plan d'étage trouvé. Créez d'abord un plan d'étage dans l'éditeur.
            </div>
          )}
        </div>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Link href="/floor-plan-editor">
            <Button variant="outline" size={isMobile ? "sm" : "default"} className="w-full sm:w-auto bg-transparent">
              <Map className="h-4 w-4 mr-2" />
              Créer un plan
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size={isMobile ? "sm" : "default"}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
