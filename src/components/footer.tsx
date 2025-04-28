import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <div className='my-2 text-center'>
      <p>{t('copyright')}</p>
    </div>
  );
}
