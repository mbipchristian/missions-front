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

const languages = {
  en: { 
    name: 'English', 
    flag: '🇺🇸',
    nativeName: 'English'
  },
  fr: { 
    name: 'Français', 
    flag: '🇫🇷',
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
          className="flex items-center gap-2 hover:bg-blue-100 text-gray-600 hover:text-blue-700 transition-all duration-200 px-3 py-2 rounded-xl border border-blue-200 bg-white/70 backdrop-blur-sm"
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLanguage?.flag}</span>
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
            <span className="text-lg">{lang.flag}</span>
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