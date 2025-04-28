import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LocalSwitcher from './local-switcher';

export default function Header() {
  const t = useTranslations('Navigation');

  return (
    <header className='p-2'>
      <nav className='flex justify-end'>
        <LocalSwitcher />
      </nav>
    </header>
  );
}
