'use client'

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LocalSwitcher from './local-switcher';
import { LogOut, User, Home, Briefcase, FileText, Settings, Target, Shield, Bell, Check, X } from 'lucide-react';
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
import { useState } from 'react';

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

  // État pour les notifications (exemple de données)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nouveau mandat assigné",
      message: "Un mandat d'audit a été assigné à votre équipe",
      time: "Il y a 5 min",
      read: false,
      type: "mandate"
    },
    {
      id: 2,
      title: "Ordre de mission approuvé",
      message: "Votre ordre de mission OM-2024-001 a été approuvé",
      time: "Il y a 2 heures",
      read: false,
      type: "order"
    },
    {
      id: 3,
      title: "Rapport en attente",
      message: "Le rapport de mission doit être soumis avant demain",
      time: "Il y a 1 jour",
      read: true,
      type: "report"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
            src="/logoAPPLI.png" 
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
        
        {/* Section droite - Notifications & User Profile */}
        <div className="flex items-center gap-3">
          <LocalSwitcher />
          
          {/* Notifications */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="relative h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <Bell className="h-5 w-5 text-white" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{unreadCount}</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-96 bg-white border border-yellow-200 shadow-xl rounded-xl p-0" 
                align="end"
              >
                {/* Header des notifications */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-t-xl border-b border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-yellow-600" />
                      <span className="font-bold text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-yellow-600 hover:text-yellow-700 text-xs"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Tout marquer lu
                      </Button>
                    )}
                  </div>
                </div>

                {/* Liste des notifications */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium text-sm ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNotification(notification.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-600 hover:text-gray-800"
                    >
                      Voir toutes les notifications
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
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