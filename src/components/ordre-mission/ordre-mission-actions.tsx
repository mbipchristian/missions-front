"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileUpload } from "@/components/ui/file-upload"
import { CheckCircle, Download, Upload, X } from "lucide-react"
import type { OrdreMission } from "@/types"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface OrdreMissionActionsProps {
  ordreMission: OrdreMission
  actions: ("confirm" | "reject" | "downloadPdf" | "addAttachments")[]
  onActionComplete?: () => void
}

export function OrdreMissionActions({ ordreMission, actions, onActionComplete }: OrdreMissionActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const { toast } = useToast()

  const handleConfirm = async () => {
    try {
      setLoading("confirm")
      await apiService.confirmOrdreMission(ordreMission.id)
      toast({
        title: "Succès",
        description: "Ordre de mission confirmé avec succès",
      })
      onActionComplete?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la confirmation de l'ordre de mission",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    try {
      setLoading("reject")
      await apiService.rejectOrdreMission(ordreMission.id)
      toast({
        title: "Succès",
        description: "Ordre de mission rejeté",
      })
      onActionComplete?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du rejet de l'ordre de mission",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      setLoading("download")
      const blob = await apiService.downloadOrdreMissionPdf(ordreMission.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ordre-mission-${ordreMission.reference}.pdf`
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

  const handleAddAttachments = async () => {
    if (attachmentFiles.length === 0) return

    try {
      setLoading("addAttachments")
      const formData = new FormData()
      attachmentFiles.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })

      await apiService.addOrdreMissionAttachments(ordreMission.id, formData)
      toast({
        title: "Succès",
        description: "Pièces jointes ajoutées avec succès",
      })
      onActionComplete?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout des pièces jointes",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const addAttachmentFile = (file: File) => {
    setAttachmentFiles((prev) => [...prev, file])
  }

  const removeAttachmentFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex space-x-2">
      {actions.includes("confirm") && (
        <Button size="sm" onClick={handleConfirm} disabled={loading === "confirm"}>
          <CheckCircle className="h-4 w-4 mr-1" />
          {loading === "confirm" ? "Confirmation..." : "Confirmer"}
        </Button>
      )}

      {actions.includes("reject") && (
        <Button variant="destructive" size="sm" onClick={handleReject} disabled={loading === "reject"}>
          <X className="h-4 w-4 mr-1" />
          {loading === "reject" ? "Rejet..." : "Rejeter"}
        </Button>
      )}

      {actions.includes("downloadPdf") && (
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={loading === "download"}>
          <Download className="h-4 w-4 mr-1" />
          {loading === "download" ? "Téléchargement..." : "PDF"}
        </Button>
      )}

      {actions.includes("addAttachments") && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Pièces jointes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter des pièces jointes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FileUpload
                onFileSelect={addAttachmentFile}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                label="Ajouter un fichier"
              />

              {attachmentFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Fichiers sélectionnés :</h4>
                  {attachmentFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeAttachmentFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleAddAttachments}
                  disabled={attachmentFiles.length === 0 || loading === "addAttachments"}
                >
                  {loading === "addAttachments" ? "Ajout..." : "Ajouter"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
