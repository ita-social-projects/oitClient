import LangButton from '@components/LangButton/LangButton';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import styles from './Header.module.scss';

export function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const location = useLocation();

  return (
    <header className="shadow z-20">
      <div className={styles.header}>
        <div>
          <h1>{t('header.title')}</h1>
          <div className="opacity-90 mt-2">{t('header.subtitle')}</div>
        </div>
        <div className="flex items-center gap-4">
          <LangButton className="btn-flat text-white" variant="short" />
          <button className="btn select-none" type="button" onClick={() => navigate('/signIn')}>
            {t('header.signIn')}
          </button>
          <button className="btn-regular select-none" type="button" onClick={() => navigate('/registration')}>
            {t('header.signUp')}
          </button>
        </div>
      </div>
      <nav className="flex gap-7.5 justify-start bg-white px-8 py-3">
        <Link to="/" className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}>
          {t('navbar.home')}
        </Link>
        <Link
          to="/news"
          className={`${styles.link} ${location.pathname === '/news' ? styles.active : ''}`}
        >
          {t('navbar.news')}
        </Link>

        <Link
          to="/admin/users"
          className={`${styles.link} ${location.pathname === '/admin/users' ? styles.active : ''}`}
        >
          {t('navbar.admin')}
        </Link>
      </nav>
    </header>
  );
}
