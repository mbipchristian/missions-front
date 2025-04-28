'use client';
import { useTranslations } from 'use-intl';
export default function NotFound() {
  const t = useTranslations('NotFoundPage');
  return (
    <html>
      <body className='text-center'>
        <h1 className='mt-10 font-semibold'>{t('title')}</h1>
      </body>
    </html>
  );
}
