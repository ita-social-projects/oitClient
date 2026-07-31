import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import styles from './CabinetPanel.module.scss';
import { useCanManageNews } from '@hooks/useCanManageNews';

export const CabinetPanel = () => {
  const { t } = useTranslation('profile');
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuth((state: AuthState) => state.user);
  const logout = useAuth((state: AuthState) => state.logout);
  const canManageNews = useCanManageNews();

  if (!user) return null;

  return (
    <aside
      className={`${styles.sidenav} sticky top-0 h-dvh w-72 bg-white border-r solid border-gray-200`}
    >
      <nav className="flex flex-col h-full">
        <div className="p-5">
          <Link to="/profile" className="flex items-center">
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
              className={location?.pathname === '/admin/users' ? styles.active : ''}
            >
              <i className="fa-solid fa-users-gear"></i>
              <span>{t('navigation.users')}</span>
            </Link>
          )}
          <Link
            to="/competitions"
            className={location?.pathname === '/competitions' ? styles.active : ''}
          >
            <i className="fa-solid fa-trophy"></i>
            <span>{t('navigation.competitions')}</span>
          </Link>
          <Link to="/archive" className={location?.pathname === '/archive' ? styles.active : ''}>
            <i className="fa-solid fa-box-archive"></i>
            <span>{t('navigation.archive')}</span>
          </Link>
          {canManageNews && (
            <Link
              to="/profile/news"
              className={location?.pathname.startsWith('/profile/news') ? styles.active : ''}
            >
              <i className="fa-solid fa-newspaper"></i>
              <span>{t('newsManagement')}</span>
            </Link>
          )}
        </div>
        <div className="p-5">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>{t('navigation.logout')}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
