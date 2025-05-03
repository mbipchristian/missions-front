import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// Le middleware d'internationalisation de next-intl
const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'fr'
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Vérifie si le chemin commence déjà par un préfixe de langue
  if (!pathname.match(/^\/(fr|en)\//)) {
    // Récupère la langue préférée depuis les cookies
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value || 'fr';
    
    // Crée une nouvelle URL avec le préfixe de langue
    const newUrl = new URL(`/${cookieLocale}${pathname}`, request.url);
    
    // Conserve les paramètres de requête
    newUrl.search = request.nextUrl.search;
    
    // Effectue la redirection
    return NextResponse.redirect(newUrl);
  }
  
  // Utilise le middleware normal de next-intl pour les routes qui ont déjà un préfixe
  return intlMiddleware(request);
}

// Configuration des chemins à intercepter
export const config = {
  // Intercepte toutes les routes sauf les assets statiques et les API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};