"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { FileUpload } from "@/components/ui/file-upload"
import { CheckCircle, Download, Upload, X, AlertTriangle } from 'lucide-react'
import type { OrdreMission } from "@/types"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface OrdreMissionActionsProps {
  ordreMission: OrdreMission
  actions: ("confirm" | "reject" | "downloadPdf" | "addAttachments" | "edit")[]
  onActionComplete?: () => void
}

export function OrdreMissionActions({ ordreMission, actions, onActionComplete }: OrdreMissionActionsProps) {
  const t = useTranslations("OrdreMissionActions")
  const [loading, setLoading] = useState<string | null>(null)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Détermine si on est sur la page en attente de justificatif
  const isJustificatifPage = actions.includes("addAttachments")

  const handleConfirm = async () => {
    try {
      setLoading("confirm")
      await apiService.confirmOrdreMission(ordreMission.id)
      toast({
        title: t("success.title"),
        description: t("success.missionOrderConfirmed"),
      })
      setShowConfirmDialog(false)
      onActionComplete?.()
    } catch (error) {
      toast({
        title: t("errors.title"),
        description: t("errors.confirmFailed"),
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
        title: t("success.title"),
        description: t("success.missionOrderRejected"),
      })
      setShowRejectDialog(false)
      onActionComplete?.()
    } catch (error) {
      toast({
        title: t("errors.title"),
        description: t("errors.rejectFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  // Méthode originale pour la page en attente de justificatif
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
        title: t("errors.title"),
        description: t("errors.pdfDownloadFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  // Nouvelle méthode pour les autres pages
  const handleDownloadPieceJointe = async (pieceJointeId: number, nomOriginal?: string) => {
    try {
      setLoading(`download-${pieceJointeId}`)
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

  const handleAddAttachments = async () => {
    if (attachmentFiles.length === 0) return
    try {
      setLoading("addAttachments")
      for (let i = 0; i < attachmentFiles.length; i++) {
        const file = attachmentFiles[i]
        await apiService.addOrdreMissionAttachments(ordreMission.id, file)
      }
      toast({
        title: t("success.title"),
        description: t("success.attachmentsAdded"),
      })
      onActionComplete?.()
    } catch (error) {
      console.error("Erreur upload:", error)
      toast({
        title: t("errors.title"),
        description: t("errors.addAttachmentsFailed"),
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
                  {t("dialogs.confirm.description", { reference: ordreMission.reference })}
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

      {actions.includes("reject") && (
        <>
          <Button variant="destructive" size="sm" onClick={() => setShowRejectDialog(true)}>
            <X className="h-4 w-4 mr-1" />
            {t("buttons.reject")}
          </Button>
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {t("dialogs.reject.title")}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  {t("dialogs.reject.description", { reference: ordreMission.reference })}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("dialogs.reject.warning")}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={loading === "reject"}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={loading === "reject"}
                >
                  {loading === "reject" ? t("buttons.rejecting") : t("buttons.reject")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {actions.includes("downloadPdf") && (
        <>
          {isJustificatifPage ? (
            // Page en attente de justificatif - utilise handleDownloadPdf
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={loading === "download"}>
              <Download className="h-4 w-4 mr-1" />
              {loading === "download" ? t("buttons.downloading") : t("buttons.print")}
            </Button>
          ) : (
            // Autres pages - utilise handleDownloadPieceJointe
            <>
              {ordreMission.piecesJointes && ordreMission.piecesJointes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {ordreMission.piecesJointes.map((pieceJointe, index) => (
                    <Button
                      key={pieceJointe.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPieceJointe(pieceJointe.id, pieceJointe.nomOriginal)}
                      disabled={loading === `download-${pieceJointe.id}`}
                      title={t("documents.downloadTitle", { name: pieceJointe.nomOriginal || t("documents.document") })}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {loading === `download-${pieceJointe.id}` ? "..." : t("documents.pdf", { number: index > 0 ? ` ${index + 1}` : "" })}
                    </Button>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400">{t("documents.noDocument")}</span>
              )}
            </>
          )}
        </>
      )}

      {actions.includes("addAttachments") && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              {t("buttons.attachments")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialogs.addAttachments.title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FileUpload
                onFileSelect={addAttachmentFile}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                label={t("dialogs.addAttachments.fileLabel")}
              />
              {attachmentFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">{t("dialogs.addAttachments.selectedFiles")}</h4>
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
                  {loading === "addAttachments" ? t("buttons.adding") : t("buttons.add")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
