"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
//import { createUser } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

// Données pour les grades
const grades = [
  { id: "AE", label: "Grade A - Direction" },
  { id: "AM", label: "Grade B - Cadre supérieur" },
  { id: "CA", label: "Grade C - Cadre" },
  { id: "CB", label: "Grade D - Agent de maîtrise" },
  { id: "CS", label: "Grade E - Agent d'exécution" },
  { id: "SD", label: "Grade A - Direction" },
  { id: "D", label: "Grade B - Cadre supérieur" },
  { id: "I", label: "Grade C - Cadre" },
  { id: "CT", label: "Grade D - Agent de maîtrise" },
  { id: "DGA", label: "Grade E - Agent d'exécution" },
  { id: "DG", label: "Grade E - Agent d'exécution" },
]

// Données pour les roles
const roles = [
  { id: "AGENT_ART", label: "Agent ART" },
  { id: "AGENT_RH", label: "Agent RH" },
  { id: "DP", label: "DP" },
  { id: "DRH", label: "DRH" },
  { id: "ADMIN", label: "Administrateur" },
]

// Schéma de validation
const formSchema = z
  .object({
    username: z
      .string(),
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z
      .string(),
    //   .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    //   .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    //   .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    //   .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    //   .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
    confirmPassword: z.string(),
    grade: z.string().min(1, "Veuillez sélectionner un grade"),
    role: z.string().min(1, "Veuillez sélectionner un role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

export default function UserRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      grade: "",
      role: "",
    },
  })

// Méthode de récupération du token

  function getToken() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('Aucun token trouvé');
        return null;
      }
  
      // Validation supplémentaire du format
      if (token.split('.').length !== 3) {
        console.error('Token invalide', token);
        return null;
      }
  
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token', error);
      return null;
    }
  }

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)
      const token = getToken();
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          grade: data.grade,
          role: data.role        })
      });
      
      const result = await response.json();

      if (response.ok) {
        // Si la création du compte est réussie
        toast({
          title: "Compte créé avec succès",
          description: "Le compte utilisateur a été créé avec succès.",
          variant: "default"
        })
        form.reset()
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Erreur lors de la création du compte:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue lors de la création du compte utilisateur.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'utilisateur</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Le nom d'utilisateur doit contenir uniquement des lettres, chiffres et underscores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    L'adresse email sera utilisée pour la connexion et les notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">{showPassword ? "Masquer" : "Afficher"} le mot de passe</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et
                      un caractère spécial.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? "Masquer" : "Afficher"} le mot de passe
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>Veuillez saisir à nouveau votre mot de passe pour confirmation.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un grade" />
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Le role détermine les droits d'accès de l'utilisateur.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer le compte"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
