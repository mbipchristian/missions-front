"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileUpload } from "@/components/ui/file-upload"
import { CheckCircle, Eye, Download, Upload } from "lucide-react"
import type { Mandat } from "@/types"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface MandatActionsProps {
  mandat: Mandat
  actions: ("confirm" | "details" | "downloadPdf" | "addReport")[]
  onActionComplete?: () => void
}

export function MandatActions({ mandat, actions, onActionComplete }: MandatActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [reportFile, setReportFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleConfirm = async () => {
    try {
      setLoading("confirm")
      // Appel API pour confirmer le mandat
      await apiService.confirmMandat(mandat.id)
      toast({
        title: "Succès",
        description: "Mandat confirmé avec succès",
      })
      onActionComplete?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la confirmation du mandat",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      setLoading("download")
      // Appel API pour télécharger le PDF
      const blob = await apiService.downloadMandatPdf(mandat.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mandat-${mandat.reference}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du PDF",
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
        title: "Succès",
        description: "Rapport ajouté avec succès",
      })
      onActionComplete?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du rapport",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex space-x-2">
      {actions.includes("confirm") && (
        <Button size="sm" onClick={handleConfirm} disabled={loading === "confirm"}>
          <CheckCircle className="h-4 w-4 mr-1" />
          {loading === "confirm" ? "Confirmation..." : "Confirmer"}
        </Button>
      )}

      {actions.includes("details") && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Détails
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du mandat {mandat.reference}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Objectif</h4>
                <p className="text-sm text-muted-foreground">{mandat.objectif}</p>
              </div>
              {/* Autres détails du mandat */}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {actions.includes("downloadPdf") && (
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={loading === "download"}>
          <Download className="h-4 w-4 mr-1" />
          {loading === "download" ? "Téléchargement..." : "PDF"}
        </Button>
      )}

      {actions.includes("addReport") && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Ajouter rapport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un rapport</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FileUpload onFileSelect={setReportFile} accept=".pdf" label="Rapport PDF" />
              <div className="flex justify-end space-x-2">
                <Button onClick={handleAddReport} disabled={!reportFile || loading === "addReport"}>
                  {loading === "addReport" ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
