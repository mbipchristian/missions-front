"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { FileUpload } from "@/components/ui/file-upload"
import { CheckCircle, Eye, Download, Upload } from 'lucide-react'
import type { Mandat } from "@/types"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface MandatActionsProps {
  mandat: Mandat
  actions: ("confirm" | "details" | "downloadPdf" | "addReport")[]
  onActionComplete?: () => void
}

export function MandatActions({ mandat, actions, onActionComplete }: MandatActionsProps) {
  const t = useTranslations("MandatActions")
  const [loading, setLoading] = useState<string | null>(null)
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    try {
      setLoading("confirm")
      await apiService.confirmMandat(mandat.id)
      toast({
        title: t("success.title"),
        description: t("success.mandatConfirmed"),
      })
      setShowConfirmDialog(false)
      onActionComplete?.()
    } catch (error) {
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.confirmFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadPieceJointe = async (pieceJointeId: number, nomOriginal?: string) => {
    try {
      setLoading("download")
      const blob = await apiService.downloadPieceJointe(pieceJointeId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = nomOriginal || `document_${pieceJointeId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: t("success.title"),
        description: t("success.fileDownloaded"),
        variant: "default",
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: t("errors.title"),
        description: t("errors.downloadFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleAddReport = async () => {
    if (!reportFile) return
    try {
      setLoading("addReport")
      const formData = new FormData()
      formData.append("rapport", reportFile)
      await apiService.addMandatReport(mandat.id, formData)
      toast({
        title: t("success.title"),
        description: t("success.reportAdded"),
      })
      onActionComplete?.()
    } catch (error) {
      toast({
        title: t("errors.title"),
        description: t("errors.addReportFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex space-x-2">
      {actions.includes("confirm") && (
        <>
          <Button size="sm" onClick={() => setShowConfirmDialog(true)}>
            <CheckCircle className="h-4 w-4 mr-1" />
            {t("buttons.confirm")}
          </Button>
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {t("dialogs.confirm.title")}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  {t("dialogs.confirm.description", { reference: mandat.reference })}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("dialogs.confirm.warning")}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={loading === "confirm"}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={loading === "confirm"}
                >
                  {loading === "confirm" ? t("buttons.confirming") : t("buttons.confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {actions.includes("details") && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              {t("buttons.details")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialogs.details.title", { reference: mandat.reference })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">{t("details.reference")}</h4>
                  <p className="text-sm text-muted-foreground">{mandat.reference}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t("details.status")}</h4>
                  <p className="text-sm text-muted-foreground">{mandat.statut}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold">{t("details.objective")}</h4>
                <p className="text-sm text-muted-foreground">{mandat.objectif}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">{t("details.startDate")}</h4>
                  <p className="text-sm text-muted-foreground">{new Date(mandat.dateDebut).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t("details.endDate")}</h4>
                  <p className="text-sm text-muted-foreground">{new Date(mandat.dateFin).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">{t("details.duration")}</h4>
                  <p className="text-sm text-muted-foreground">{t("details.durationValue", { days: mandat.duree })}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t("details.controlMission")}</h4>
                  <p className="text-sm text-muted-foreground">{mandat.missionDeControle ? t("common.yes") : t("common.no")}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold">{t("details.users")}</h4>
                  <p className="text-sm text-muted-foreground">{t("details.usersCount", { count: mandat.usersCount })}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t("details.cities")}</h4>
                  <p className="text-sm text-muted-foreground">{t("details.citiesCount", { count: mandat.villesCount })}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t("details.resources")}</h4>
                  <p className="text-sm text-muted-foreground">{t("details.resourcesCount", { count: mandat.ressourcesCount })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">{t("details.createdBy")}</h4>
                  <p className="text-sm text-muted-foreground">{mandat.createdBy}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{t("details.createdAt")}</h4>
                  <p className="text-sm text-muted-foreground">{new Date(mandat.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {mandat.confirmePar && mandat.confirmele && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">{t("details.confirmedBy")}</h4>
                    <p className="text-sm text-muted-foreground">ID: {mandat.confirmePar}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("details.confirmedAt")}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(mandat.confirmele).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {mandat.users.length > 0 && (
                <div>
                  <h4 className="font-semibold">{t("details.assignedUsers")}</h4>
                  <div className="text-sm text-muted-foreground">
                    {mandat.users.map((user, index) => (
                      <span key={user.id}>
                        {user.username}
                        {index < mandat.users.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mandat.villes.length > 0 && (
                <div>
                  <h4 className="font-semibold">{t("details.concernedCities")}</h4>
                  <div className="text-sm text-muted-foreground">
                    {mandat.villes.map((ville, index) => (
                      <span key={ville.id}>
                        {ville.name}
                        {index < mandat.villes.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mandat.ressources.length > 0 && (
                <div>
                  <h4 className="font-semibold">{t("details.allocatedResources")}</h4>
                  <div className="text-sm text-muted-foreground">
                    {mandat.ressources.map((ressource, index) => (
                      <span key={ressource.id}>
                        {ressource.name}
                        {index < mandat.ressources.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {actions.includes("downloadPdf") && mandat.piecesJointes && mandat.piecesJointes.length > 0 && (
        <>
          {mandat.piecesJointes.map((pieceJointe, index) => (
            <Button 
              key={pieceJointe.id}
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadPieceJointe(pieceJointe.id, pieceJointe.nomOriginal)}
              disabled={loading === "download"}
            >
              <Download className="h-4 w-4 mr-1" />
              {loading === "download" ? t("buttons.downloading") : 
                index === 0 ? t("documents.mandat") : 
                index === 1 ? t("documents.report") : 
                t("documents.pdf", { number: index + 1 })}
            </Button>
          ))}
        </>
      )}

      {actions.includes("addReport") && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              {t("buttons.addReport")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.addReport.title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FileUpload onFileSelect={setReportFile} accept=".pdf" label={t("dialogs.addReport.fileLabel")} />
              <div className="flex justify-end space-x-2">
                <Button onClick={handleAddReport} disabled={!reportFile || loading === "addReport"}>
                  {loading === "addReport" ? t("buttons.adding") : t("buttons.add")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
