"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SavePlanDialogProps {
  showSaveDialog: boolean
  setShowSaveDialog: (show: boolean) => void
  planName: string
  setPlanName: (name: string) => void
  handleSaveFloorPlan: () => void
}

export function SavePlanDialog({
  showSaveDialog,
  setShowSaveDialog,
  planName,
  setPlanName,
  handleSaveFloorPlan,
}: SavePlanDialogProps) {
  return (
    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sauvegarder le plan d'étage</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-name" className="text-right">
              Nom
            </Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="col-span-3"
              placeholder="Entrez le nom du plan d'étage"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
            Annuler
          </Button>
          <Button onClick={handleSaveFloorPlan}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
