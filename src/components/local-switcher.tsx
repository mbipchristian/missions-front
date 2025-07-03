'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Composants SVG pour les drapeaux
const FrenchFlag = ({ className = "w-6 h-4" }) => (
  <svg className={className} viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
    <rect width="1" height="2" fill="#0055A4"/>
    <rect x="1" width="1" height="2" fill="#FFFFFF"/>
    <rect x="2" width="1" height="2" fill="#EF4135"/>
  </svg>
);

const EnglishFlag = ({ className = "w-6 h-4" }) => (
  <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="30" fill="#012169"/>
    <g stroke="#fff" strokeWidth="6">
      <path d="m0,0 60,30 m0,-30 L0,30"/>
    </g>
    <g stroke="#C8102E" strokeWidth="4">
      <path d="m0,0 60,30 m0,-30 L0,30"/>
    </g>
    <path stroke="#fff" strokeWidth="10" d="M30,0 v30 M0,15 h60"/>
    <path stroke="#C8102E" strokeWidth="6" d="M30,0 v30 M0,15 h60"/>
  </svg>
);

const languages = {
  en: { 
    name: 'English', 
    flag: <EnglishFlag />,
    nativeName: 'English'
  },
  fr: { 
    name: 'Français', 
    flag: <FrenchFlag />,
    nativeName: 'Français'
  }
};

export default function LocalSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const handleLanguageChange = (nextLocale: string) => {
    // Get the path without the locale prefix
    const currentPathname = pathname.replace(`/${locale}`, '') || '/';
    
    startTransition(() => {
      router.replace(`/${nextLocale}${currentPathname}`);
    });
  };

  const currentLanguage = languages[locale as keyof typeof languages];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="flex items-center gap-2 text-white transition-all duration-200 px-3 py-2 rounded-xl border border-blue-700 bg-blue-600 backdrop-blur-sm"
        >
          <Globe className="h-4 w-4" />
          <div className="flex items-center">
            {currentLanguage?.flag}
          </div>
          <span className="hidden sm:inline font-medium">
            {currentLanguage?.nativeName}
          </span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48 bg-white shadow-xl border border-blue-200 rounded-xl">
        {Object.entries(languages).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
              locale === code 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'hover:bg-blue-50 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              {lang.flag}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-gray-500">{lang.name}</span>
            </div>
            {locale === code && (
              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}