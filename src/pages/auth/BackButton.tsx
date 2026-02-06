import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const BackButton = () => {
  const { t } = useTranslation(['auth']);
  return (
    <Link to="/" className="hover:text-primary-100">
      <i className="fa-solid fa-angle-left"></i>
      <span className="ml-2">{t('toHome')}</span>
    </Link>
  );
};
