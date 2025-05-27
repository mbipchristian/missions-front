"use client"
import { useTranslations } from 'next-intl';
import { CardHeader, CardTitle, CardDescription, Card } from '@/components/ui/card';

import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const t = useTranslations('LoginPage');
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()
      console.log("Status:", response.status,"Response data:", data);


      if (!response.ok) {
        // Si le statut est 401, on affiche le message d'erreur d'authentification
        if (response.status === 401) {
          // Récupérer le message d'erreur du backend si disponible
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.description || "The username or password is incorrect");
        }
        throw new Error(`Erreur ${response.status}`);
      }
        // Authentification réussie
      if (data.token) {
        
        localStorage.setItem("authToken", data.token);
        // Get the current locale from the URL
        const locale = window.location.pathname.split("/")[1]
        // Redirect to dashboard
        setTimeout(() => {
          router.push(`/${locale}/dashboard`)
          router.refresh()
        }, 1000)
      } else {
        throw new Error("Aucun token dans la réponse");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('title')}</CardTitle>
          <CardDescription className="text-center">{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
  <Label htmlFor="username">{t('field1')}</Label>
  <Input
    id="email"
    type="email"
    placeholder="votre@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('field2')}</Label>
                <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                  {t('button1')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loggingIn')  : t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
