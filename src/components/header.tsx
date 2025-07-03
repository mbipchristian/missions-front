'use client'

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LocalSwitcher from './local-switcher';
import { LogOut, User, Home, Briefcase, FileText, Settings, Target, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, getRoleDisplayName } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

// Fonction pour obtenir le titre et l'icône de la page
const getPageInfo = (pathname) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const locale = pathSegments[0];
  const currentPath = pathname.replace(`/${locale}`, '');

  // Configuration des pages avec leurs titres et icônes
  const pageConfig = {
    '/dashboard': { title: 'Tableau de bord', icon: Home },
    
    // Mandats
    '/dashboard/mandats/enregistrer-mandat': { title: 'Enregistrer un mandat', icon: Target },
    '/dashboard/mandats/en-attente-confirmation': { title: 'Mandats en attente de confirmation', icon: Briefcase },
    '/dashboard/mandats/en-attente-execution': { title: 'Mandats en attente d\'exécution', icon: Briefcase },
    '/dashboard/mandats/en-cours': { title: 'Mandats en cours', icon: Briefcase },
    '/dashboard/mandats/acheve': { title: 'Mandats achevés', icon: Briefcase },
    '/dashboard/mandats/mes-mandats': { title: 'Mes mandats', icon: Briefcase },
    '/dashboard/mandats/tous': { title: 'Tous les mandats', icon: Briefcase },
    
    // Ordres de missions
    '/dashboard/ordres-mission/en-attente-justificatif': { title: 'En attente de pièce jointe', icon: FileText },
    '/dashboard/ordres-mission/en-attente-confirmation': { title: 'Ordres en attente de confirmation', icon: FileText },
    '/dashboard/ordres-mission/en-attente-execution': { title: 'Ordres en attente d\'exécution', icon: FileText },
    '/dashboard/ordres-mission/en-cours': { title: 'Ordres en cours', icon: FileText },
    '/dashboard/ordres-mission/acheve': { title: 'Ordres achevés', icon: FileText },
    '/dashboard/ordres-mission/mes-ordres-mission': { title: 'Mes ordres de missions', icon: FileText },
    
    // Configurations
    '/dashboard/configurations/register': { title: 'Créer un compte utilisateur', icon: User },
    '/dashboard/configurations/users': { title: 'Gérer les utilisateurs', icon: Settings },
    '/dashboard/configurations/fonctions': { title: 'Gestion des fonctions', icon: Briefcase },
    '/dashboard/configurations/rangs': { title: 'Gestion des rangs', icon: Shield },
  };

  // Recherche exacte d'abord
  if (pageConfig[currentPath]) {
    return pageConfig[currentPath];
  }

  // Recherche par segments pour les pages dynamiques
  if (currentPath.startsWith('/dashboard/mandats/')) {
    return { title: 'Gestion des mandats', icon: Briefcase };
  }
  if (currentPath.startsWith('/dashboard/ordres-mission/')) {
    return { title: 'Gestion des ordres de missions', icon: FileText };
  }
  if (currentPath.startsWith('/dashboard/configurations/')) {
    return { title: 'Configurations', icon: Settings };
  }
  if (currentPath.startsWith('/dashboard')) {
    return { title: 'Tableau de bord', icon: Home };
  }

  // Page par défaut
  return { title: 'Application', icon: Home };
};

export default function Header() {
  const t = useTranslations('Navigation');
  const { user, logout } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  // Obtenir les informations de la page actuelle
  const pageInfo = getPageInfo(pathname);
  const PageIcon = pageInfo.icon;

  return (
    <header className='fixed top-0 left-0 right-0 z-50 h-16 w-full p-2 bg-white/90 backdrop-blur-md border-b border-gray-200/50'>
  <div className='flex items-center justify-between w-full relative'>
    {/* Section gauche - Logo */}
    <div className="flex items-center gap-4">
      <img 
        src="/ART.png" 
        alt="Logo de l'application"
        className="h-14 w-32 rounded ml-14"
      />
    </div>
    
    {/* Titre de la page centré */}
    <div className="absolute left-1/2 transform -translate-x-1/2">
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <PageIcon className="h-5 w-5 text-blue-600" />
        <span className="text-blue-900 font-semibold text-lg">
          {pageInfo.title}
        </span>
      </div>
    </div>
    
    {/* Section droite - User Profile */}
    <div className="flex items-center gap-4">
      <LocalSwitcher />
      
      {/* User Profile Dropdown */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="relative h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <User className="h-5 w-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-80 bg-white border border-blue-200 shadow-xl rounded-xl p-0" 
            align="end"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-t-xl border-b border-blue-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-600 truncate">{user.fonction?.nom || "Fonction non définie"}</p>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 text-xs px-3 py-1">
                  {getRoleDisplayName(user.role.name)}
                </Badge>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="p-2">
              <DropdownMenuItem asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 hover:text-red-800 transition-all duration-300 group" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">Se déconnecter</span>
                </Button>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  </div>
</header>
  );
}