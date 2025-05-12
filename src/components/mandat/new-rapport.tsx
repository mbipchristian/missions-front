"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { FileUp, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { uploadRapport } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

// Schéma de validation
const formSchema = z.object({
  reference: z.string().min(1, "La référence du mandat est requise"),
  rapport: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Le fichier PDF est requis")
    .refine((files) => files[0]?.type === "application/pdf", "Le fichier doit être au format PDF")
    .refine((files) => files[0]?.size <= 10 * 1024 * 1024, "La taille du fichier ne doit pas dépasser 10 Mo"),
})

type FormValues = z.infer<typeof formSchema>

export default function RapportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const currentDate = new Date()
  const formattedDate = format(currentDate, "PPP", { locale: fr })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reference: "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)

      // Création d'un objet FormData pour envoyer le fichier
      const formData = new FormData()
      formData.append("reference", data.reference)
      formData.append("dateEnregistrement", currentDate.toISOString())
      formData.append("rapport", data.rapport[0])

      // Appel de l'action serveur
      const result = await uploadRapport(formData)

      if (result.success) {
        toast({
          title: "Rapport enregistré",
          description: "Votre rapport de mission a été enregistré avec succès.",
        })
        form.reset()
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement du rapport.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Référence du mandat</FormLabel>
              <FormControl>
                <Input placeholder="REF-2024-001" {...field} />
              </FormControl>
              <FormDescription>Entrez la référence du mandat correspondant à ce rapport</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date d'enregistrement</label>
            <Input value={formattedDate} disabled className="bg-muted" />
            <p className="text-sm text-muted-foreground">Date générée automatiquement</p>
          </div>

          <FormField
            control={form.control}
            name="rapport"
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Rapport de mission (PDF)</FormLabel>
                <FormControl>
                  <div className="grid w-full gap-2">
                    <label
                      htmlFor="rapport-file"
                      className="cursor-pointer flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                      <FileUp className="h-4 w-4" />
                      <span>Sélectionner un fichier PDF</span>
                    </label>
                    <Input
                      id="rapport-file"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        onChange(e.target.files)
                      }}
                      {...fieldProps}
                    />
                    {value && value[0] && (
                      <p className="text-sm text-muted-foreground">
                        Fichier sélectionné: {value[0].name} ({Math.round(value[0].size / 1024)} Ko)
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </>
          ) : (
            "Enregistrer le rapport"
          )}
        </Button>
      </form>
    </Form>
  )
}
