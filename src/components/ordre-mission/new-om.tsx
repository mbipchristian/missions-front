"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { differenceInDays, format, isAfter, isBefore } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
//import { createOrdreMission } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { convertNumberToWords } from "@/lib/number-to-words"

// Types pour les données du mandat
interface Mandat {
  id: string
  reference: string
  objectif: string
  dateDebut: Date
  dateFin: Date
  pays: string
  ville: string
  resources: string[]
}

// Types pour les ressources
interface Resource {
  id: string
  name: string
}

// Données fictives pour les mandats
const mandatsData: Mandat[] = [
  {
    id: "1",
    reference: "REF-2024-001",
    objectif: "Audit des processus internes",
    dateDebut: new Date("2024-05-01"),
    dateFin: new Date("2024-05-15"),
    pays: "France",
    ville: "Paris",
    resources: ["1", "2", "3"],
  },
  {
    id: "2",
    reference: "REF-2024-002",
    objectif: "Évaluation des risques opérationnels",
    dateDebut: new Date("2024-05-20"),
    dateFin: new Date("2024-06-10"),
    pays: "Belgique",
    ville: "Bruxelles",
    resources: ["1", "4"],
  },
  {
    id: "3",
    reference: "REF-2024-003",
    objectif: "Contrôle de conformité réglementaire",
    dateDebut: new Date("2024-06-15"),
    dateFin: new Date("2024-06-30"),
    pays: "France",
    ville: "Lyon",
    resources: ["2", "5"],
  },
  {
    id: "4",
    reference: "REF-2024-004",
    objectif: "Analyse des processus de production",
    dateDebut: new Date("2024-07-01"),
    dateFin: new Date("2024-07-15"),
    pays: "Suisse",
    ville: "Genève",
    resources: ["1", "3"],
  },
  {
    id: "5",
    reference: "REF-2024-005",
    objectif: "Audit financier annuel",
    dateDebut: new Date("2024-08-01"),
    dateFin: new Date("2024-08-31"),
    pays: "France",
    ville: "Marseille",
    resources: ["2", "4", "5"],
  },
]

// Données fictives pour les ressources matérielles
const resourcesData: Resource[] = [
  { id: "1", name: "Ordinateur portable" },
  { id: "2", name: "Véhicule de service" },
  { id: "3", name: "Appareil photo" },
  { id: "4", name: "Tablette" },
  { id: "5", name: "Équipement de protection" },
]

// Données pour les grades
const grades = [
  { id: "A", label: "Grade A - Direction", fraisJournalier: 15000 },
  { id: "B", label: "Grade B - Cadre supérieur", fraisJournalier: 12000 },
  { id: "C", label: "Grade C - Cadre", fraisJournalier: 10000 },
  { id: "D", label: "Grade D - Agent de maîtrise", fraisJournalier: 8000 },
  { id: "E", label: "Grade E - Agent d'exécution", fraisJournalier: 6000 },
]

// Données pour les fonctions
const fonctions = [
  { id: "DG", label: "Directeur Général" },
  { id: "DGA", label: "Directeur Général Adjoint" },
  { id: "DIR", label: "Directeur" },
  { id: "CHEF", label: "Chef de service" },
  { id: "RESP", label: "Responsable" },
  { id: "CONS", label: "Conseiller" },
  { id: "TECH", label: "Technicien" },
  { id: "ASST", label: "Assistant" },
]

// Données pour les devises
const devises = ["XAF", "EUR", "USD", "GBP", "CAD"]

// Schéma de validation
const formSchema = z
  .object({
    mandatId: z.string().min(1, "Veuillez sélectionner un mandat de mission"),
    nomsPrenoms: z.string().min(3, "Veuillez entrer les noms et prénoms"),
    grade: z.string().min(1, "Veuillez sélectionner un grade"),
    fonction: z.string().min(1, "Veuillez sélectionner une fonction"),
    pays: z.string().min(1, "Le pays est requis"),
    ville: z.string().min(1, "La ville est requise"),
    objectif: z.string().min(1, "L'objectif est requis"),
    resources: z.array(z.string()).min(1, "Sélectionnez au moins une ressource matérielle"),
    modePaiement: z.string().min(1, "Veuillez sélectionner un mode de paiement"),
    devise: z.string().min(1, "Veuillez sélectionner une devise"),
    dateDebut: z.date({
      required_error: "La date de début est requise",
    }),
    dateFin: z
      .date({
        required_error: "La date de fin est requise",
      })
      .refine((date) => date, {
        message: "La date de fin est requise",
      }),
    duree: z.number().min(1, "La durée doit être d'au moins 1 jour"),
    fraisJournalier: z.number().min(1, "Les frais journaliers sont requis"),
    decompteTotal: z.number().min(1, "Le décompte total est requis"),
    tauxAvance: z.number().min(0).max(100, "Le taux d'avance doit être entre 0 et 100"),
    decompteAvance: z.number().min(0, "Le décompte d'avance ne peut pas être négatif"),
    decompteReliquat: z.number().min(0, "Le décompte de reliquat ne peut pas être négatif"),
  })
  .refine(
    (data) => {
      return data.dateFin >= data.dateDebut
    },
    {
      message: "La date de fin doit être postérieure ou égale à la date de début",
      path: ["dateFin"],
    },
  )

type FormValues = z.infer<typeof formSchema>

export default function OrdreMissionForm() {
  const [selectedMandat, setSelectedMandat] = useState<Mandat | null>(null)
  const [availableResources, setAvailableResources] = useState<Resource[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mandatId: "",
      nomsPrenoms: "",
      grade: "",
      fonction: "",
      pays: "",
      ville: "",
      objectif: "",
      resources: [],
      modePaiement: "",
      devise: "XAF",
      tauxAvance: 50, // 50% par défaut
      duree: 0,
      fraisJournalier: 0,
      decompteTotal: 0,
      decompteAvance: 0,
      decompteReliquat: 0,
    },
  })

  const { watch, setValue } = form
  const mandatId = watch("mandatId")
  const dateDebut = watch("dateDebut")
  const dateFin = watch("dateFin")
  const grade = watch("grade")
  const duree = watch("duree")
  const fraisJournalier = watch("fraisJournalier")
  const decompteTotal = watch("decompteTotal")
  const tauxAvance = watch("tauxAvance")

  // Mettre à jour les informations du mandat sélectionné
  useEffect(() => {
    if (mandatId) {
      const mandat = mandatsData.find((m) => m.id === mandatId)
      if (mandat) {
        setSelectedMandat(mandat)
        setValue("pays", mandat.pays)
        setValue("ville", mandat.ville)
        setValue("objectif", mandat.objectif)
        setValue("resources", [])

        // Filtrer les ressources disponibles pour ce mandat
        const filteredResources = resourcesData.filter((resource) => mandat.resources.includes(resource.id))
        setAvailableResources(filteredResources)
      }
    }
  }, [mandatId, setValue])

  // Mettre à jour les frais journaliers en fonction du grade
  useEffect(() => {
    if (grade) {
      const selectedGrade = grades.find((g) => g.id === grade)
      if (selectedGrade) {
        setValue("fraisJournalier", selectedGrade.fraisJournalier)
      }
    }
  }, [grade, setValue])

  // Calcul automatique de la durée
  useEffect(() => {
    if (dateDebut && dateFin) {
      const duration = differenceInDays(dateFin, dateDebut) + 1 // +1 pour inclure le jour de fin
      setValue("duree", duration)
    }
  }, [dateDebut, dateFin, setValue])

  // Calcul automatique du décompte total
  useEffect(() => {
    if (duree && fraisJournalier) {
      const total = duree * fraisJournalier
      setValue("decompteTotal", total)
    }
  }, [duree, fraisJournalier, setValue])

  // Calcul automatique du décompte d'avance et du reliquat
  useEffect(() => {
    if (decompteTotal && tauxAvance !== undefined) {
      const avance = Math.round(decompteTotal * (tauxAvance / 100))
      setValue("decompteAvance", avance)
      setValue("decompteReliquat", decompteTotal - avance)
    }
  }, [decompteTotal, tauxAvance, setValue])

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)

      // Appel de l'action serveur pour créer l'ordre de mission
      const result = await createOrdreMission({
        ...data,
        status: "en attente du visa_DG",
      })

      if (result.success) {
        toast({
          title: "Ordre de mission créé",
          description: "L'ordre de mission a été créé avec succès et est en attente du visa DG.",
        })
        form.reset()
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'ordre de mission:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'ordre de mission.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="mandatId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Référence du mandat de mission</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un mandat de mission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mandatsData.map((mandat) => (
                          <SelectItem key={mandat.id} value={mandat.id}>
                            {mandat.reference} - {mandat.objectif.substring(0, 30)}
                            {mandat.objectif.length > 30 ? "..." : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nomsPrenoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Noms et prénoms</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: DUPONT Jean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade.id} value={grade.id}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fonction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonction</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fonctions.map((fonction) => (
                              <SelectItem key={fonction.id} value={fonction.id}>
                                {fonction.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <FormDescription>Automatiquement rempli depuis le mandat</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ville"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <FormDescription>Automatiquement rempli depuis le mandat</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="objectif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectif</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-muted" />
                    </FormControl>
                    <FormDescription>Automatiquement rempli depuis le mandat</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ressources matérielles</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value.length && "text-muted-foreground")}
                            disabled={!selectedMandat}
                          >
                            {field.value.length > 0
                              ? `${field.value.length} ressource${field.value.length > 1 ? "s" : ""} sélectionnée${field.value.length > 1 ? "s" : ""}`
                              : "Sélectionner les ressources"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher une ressource..." />
                          <CommandList>
                            <CommandEmpty>Aucune ressource trouvée.</CommandEmpty>
                            <CommandGroup>
                              {availableResources.map((resource) => (
                                <CommandItem
                                  key={resource.id}
                                  value={resource.name}
                                  onSelect={() => {
                                    const currentValue = [...field.value]
                                    const index = currentValue.indexOf(resource.id)
                                    if (index === -1) {
                                      currentValue.push(resource.id)
                                    } else {
                                      currentValue.splice(index, 1)
                                    }
                                    field.onChange(currentValue)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value.includes(resource.id) ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {resource.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Sélectionnez parmi les ressources disponibles pour ce mandat</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="modePaiement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode de paiement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="especes">Espèces</SelectItem>
                          <SelectItem value="cheque_ordinaire">Chèque ordinaire</SelectItem>
                          <SelectItem value="cheque_voyage">Chèque de voyage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="devise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {devises.map((devise) => (
                            <SelectItem key={devise} value={devise}>
                              {devise}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Période et calculs financiers</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="dateDebut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              disabled={!selectedMandat}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              !selectedMandat ||
                              isBefore(date, selectedMandat.dateDebut) ||
                              isAfter(date, selectedMandat.dateFin)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        {selectedMandat
                          ? `Doit être entre le ${format(selectedMandat.dateDebut, "dd/MM/yyyy")} et le ${format(
                              selectedMandat.dateFin,
                              "dd/MM/yyyy",
                            )}`
                          : "Sélectionnez d'abord un mandat"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFin"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de fin</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              disabled={!selectedMandat || !dateDebut}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              !selectedMandat ||
                              !dateDebut ||
                              isBefore(date, dateDebut) ||
                              isAfter(date, selectedMandat.dateFin)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        {selectedMandat && dateDebut
                          ? `Doit être entre le ${format(dateDebut, "dd/MM/yyyy")} et le ${format(
                              selectedMandat.dateFin,
                              "dd/MM/yyyy",
                            )}`
                          : "Sélectionnez d'abord une date de début"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (jours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          disabled
                          className="bg-muted"
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Calculée automatiquement</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="fraisJournalier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frais journalier</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          disabled
                          className="bg-muted"
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Basé sur le grade sélectionné</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tauxAvance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux d'avance (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-6">
                <h4 className="font-medium">Décompte total</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="decompteTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant en chiffres</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            disabled
                            className="bg-muted"
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Durée × Frais journalier</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Montant en lettres</FormLabel>
                    <Input
                      value={decompteTotal ? convertNumberToWords(decompteTotal) : ""}
                      disabled
                      className="bg-muted"
                    />
                  </FormItem>
                </div>

                <h4 className="font-medium">Décompte avance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="decompteAvance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant en chiffres</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            disabled
                            className="bg-muted"
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Décompte total × Taux d'avance</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Montant en lettres</FormLabel>
                    <Input
                      value={watch("decompteAvance") ? convertNumberToWords(watch("decompteAvance")) : ""}
                      disabled
                      className="bg-muted"
                    />
                  </FormItem>
                </div>

                <h4 className="font-medium">Décompte reliquat</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="decompteReliquat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant en chiffres</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            disabled
                            className="bg-muted"
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Décompte total - Décompte avance</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Montant en lettres</FormLabel>
                    <Input
                      value={watch("decompteReliquat") ? convertNumberToWords(watch("decompteReliquat")) : ""}
                      disabled
                      className="bg-muted"
                    />
                  </FormItem>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer l'ordre de mission"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
