import LangButton from '@components/LangButton';
import useAuth from '@shared/state/authState';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import styles from './Header.module.scss';
import { UserMenu } from '../pages/CabinetPanel/UserMenu';

export function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const location = useLocation();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  return (
    <header className="shadow z-20">
      <div className={styles.header}>
        <div>
          <h1>{t('header.title')}</h1>
          <div className="opacity-90 mt-2">{t('header.subtitle')}</div>
        </div>
        <div className="flex items-center gap-4">
          <LangButton className="btn-flat text-white" variant="short" />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <button type="button" className="btn select-none" onClick={() => navigate('/signIn')}>
                {t('header.signIn')}
              </button>
              <button type="button" className="btn-regular select-none" onClick={() => navigate('/registration')}>
                {t('header.signUp')}
              </button>
            </>
          )}
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
      </nav>
    </header>
  );
}
