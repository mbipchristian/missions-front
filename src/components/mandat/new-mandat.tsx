"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { differenceInDays, format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Données fictives pour les listes déroulantes
const teamMembers = [
  { id: "1", name: "Jean Dupont" },
  { id: "2", name: "Marie Martin" },
  { id: "3", name: "Pierre Durand" },
  { id: "4", name: "Sophie Lefebvre" },
  { id: "5", name: "Thomas Bernard" },
]

const resources = [
  { id: "1", name: "Ordinateur portable" },
  { id: "2", name: "Véhicule de service" },
  { id: "3", name: "Appareil photo" },
  { id: "4", name: "Tablette" },
  { id: "5", name: "Équipement de protection" },
]

const countries = ["France", "Belgique", "Suisse", "Canada", "Maroc", "Sénégal", "Côte d'Ivoire", "Tunisie"]

// Schéma de validation
const formSchema = z
  .object({
    reference: z.string().min(1, "La référence est requise"),
    objectif: z.string().min(1, "L'objectif est requis"),
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
    duree: z.number().optional(),
    teamMembers: z.array(z.string()).min(1, "Sélectionnez au moins un membre d'équipe"),
    typeMission: z.enum(["controle", "autre"], {
      required_error: "Le type de mission est requis",
    }),
    pays: z.string().min(1, "Le pays est requis"),
    ville: z.string().min(1, "La ville est requise"),
    perimetre: z.enum(["interieur", "exterieur"], {
      required_error: "Le périmètre est requis",
    }),
    resources: z.array(z.string()).min(1, "Sélectionnez au moins une ressource matérielle"),
  })
  .refine(
    (data) => {
      return data.dateFin >= data.dateDebut
    },
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["dateFin"],
    },
  )

type FormValues = z.infer<typeof formSchema>

export default function MissionForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reference: "",
      objectif: "",
      teamMembers: [],
      typeMission: undefined,
      pays: "",
      ville: "",
      perimetre: undefined,
      resources: [],
    },
  })

  const { watch, setValue } = form
  const dateDebut = watch("dateDebut")
  const dateFin = watch("dateFin")

  // Calcul automatique de la durée
  useEffect(() => {
    if (dateDebut && dateFin) {
      const duration = differenceInDays(dateFin, dateDebut) + 1 // +1 pour inclure le jour de fin
      setValue("duree", duration)
    }
  }, [dateDebut, dateFin, setValue])

  async function onSubmit(data: FormValues) {
    try {
      console.log("Données du formulaire:", data)
      // Ici, vous pouvez appeler une action serveur pour enregistrer les données
      // await createMission(data);
      alert("Mission enregistrée avec succès!")
      form.reset()
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      alert("Une erreur est survenue lors de l'enregistrement de la mission.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence</FormLabel>
                <FormControl>
                  <Input placeholder="REF-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="typeMission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de mission</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="controle">Mission de contrôle</SelectItem>
                    <SelectItem value="autre">Autre mission</SelectItem>
                  </SelectContent>
                </Select>
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
                <Textarea placeholder="Décrivez l'objectif de la mission" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                      >
                        {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
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
                      >
                        {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < (dateDebut || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                  <Input type="number" {...field} value={field.value || ""} disabled className="bg-muted" />
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
            name="pays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
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
            name="ville"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez la ville" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="perimetre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Périmètre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un périmètre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="interieur">Intérieur</SelectItem>
                    <SelectItem value="exterieur">Extérieur</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="teamMembers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Membres de l'équipe</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value.length && "text-muted-foreground")}
                    >
                      {field.value.length > 0
                        ? `${field.value.length} membre${field.value.length > 1 ? "s" : ""} sélectionné${field.value.length > 1 ? "s" : ""}`
                        : "Sélectionner les membres"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher un membre..." />
                    <CommandList>
                      <CommandEmpty>Aucun membre trouvé.</CommandEmpty>
                      <CommandGroup>
                        {teamMembers.map((member) => (
                          <CommandItem
                            key={member.id}
                            value={member.name}
                            onSelect={() => {
                              const currentValue = [...field.value]
                              const index = currentValue.indexOf(member.id)
                              if (index === -1) {
                                currentValue.push(member.id)
                              } else {
                                currentValue.splice(index, 1)
                              }
                              field.onChange(currentValue)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value.includes(member.id) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {member.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                        {resources.map((resource) => (
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
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto">
          Enregistrer le mandat
        </Button>
      </form>
    </Form>
  )
}
