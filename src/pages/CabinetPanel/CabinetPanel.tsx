import { useCanManageNews } from '@hooks/useCanManageNews';
import { useLockBodyScroll } from '@hooks/useLockBodyScroll';
import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import styles from './CabinetPanel.module.scss';

interface CabinetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CabinetPanel = ({ isOpen, onClose }: CabinetPanelProps) => {
  const { t } = useTranslation('profile');
  const location = useLocation();
  const user = useAuth((state: AuthState) => state.user);
  const canManageNews = useCanManageNews();

  useLockBodyScroll(isOpen);

  if (!user) return null;

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`${styles.sidenav} ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform fixed lg:relative top-0 left-0 z-50 h-dvh lg:h-full w-72 bg-white border-r solid border-gray-200 shrink-0 overflow-y-auto`}
      >
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <nav className="flex flex-col h-full">
          <div className="p-5">
            <Link to="/profile" className="flex items-center" onClick={onClose}>
              <div className="rounded-full w-10 h-10 bg-primary-100 flex items-center justify-center mr-3">
                <i className="fa-solid fa-user text-white"></i>
              </div>
              <div>
                <div>
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500">{t(`roles.${user.role}`)}</div>
              </div>
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-2 border-y solid border-gray-200 p-5">
            {user.role === 'ADMIN' && (
              <Link
                to="/admin/users"
                onClick={onClose}
                className={location?.pathname === '/admin/users' ? styles.active : ''}
              >
                <i className="fa-solid fa-users-gear"></i>
                <span>{t('navigation.users')}</span>
              </Link>
            )}
            <Link
              to="/competitions"
              onClick={onClose}
              className={location?.pathname === '/competitions' ? styles.active : ''}
            >
              <i className="fa-solid fa-trophy"></i>
              <span>{t('navigation.competitions')}</span>
            </Link>
            {canManageNews && (
              <Link
                to="/profile/news"
                onClick={onClose}
                className={location?.pathname.startsWith('/profile/news') ? styles.active : ''}
              >
                <i className="fa-solid fa-newspaper"></i>
                <span>{t('newsManagement')}</span>
              </Link>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};
