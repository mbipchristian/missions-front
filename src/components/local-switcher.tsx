'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';

export default function LocalSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    
    // Get the path without the locale prefix
    const currentPathname = pathname.replace(`/${locale}`, '') || '/';
    
    startTransition(() => {
      router.replace(`/${nextLocale}${currentPathname}`);
    });
  };

  return (
    <div className='flex justify-end'>
      <label className='border-2 rounded'>
      <p className='sr-only'>change language</p>
      <select
        defaultValue={locale}
        className='bg-transparent py-2'
        onChange={onSelectChange}
        disabled={isPending}
      >
        <option value='en'>English</option>
        <option value='fr'>Francais</option>
      </select>
    </label>
    </div>
    
  );
}
