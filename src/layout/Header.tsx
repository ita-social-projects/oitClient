import LangButton from '@components/LangButton';
import useAuth from '@shared/state/authState';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserMenu } from '../pages/CabinetPanel/UserMenu.tsx';
import { MobileNavDrawer } from '../shared/components/MobileNavDrawer';

import styles from './Header.module.scss';

export function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const location = useLocation();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <header className="shadow z-20 relative">
      <div className={`${styles.header} flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 md:py-0`}>
        <div className="w-full md:flex-1 pr-0 md:pr-2 mb-3 md:mb-0 pb-3 md:pb-0 border-b border-white/20 md:border-none text-center md:text-left">
          <h1 className="!text-xl md:!text-[2.2rem] leading-tight break-words">
            {t('header.title')}
          </h1>
          <div className="opacity-90 mt-1 md:mt-2 break-words text-sm md:text-base">
            {t('header.subtitle')}
          </div>
        </div>
        
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 md:gap-4 flex-shrink-0 pt-1 md:pt-0">
          <LangButton className="btn-flat text-white" variant="short" />

          <div className="hidden md:flex items-center gap-4">
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

          <button 
            className="md:hidden p-1.5 -mr-1.5 cursor-pointer text-white transition-opacity hover:opacity-80"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      <nav className="hidden md:flex gap-7.5 justify-start bg-white px-8 py-3 border-b border-gray-200">
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

      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
}
