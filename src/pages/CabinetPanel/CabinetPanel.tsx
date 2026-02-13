import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import styles from './CabinetPanel.module.scss';

export const CabinetPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuth((state: AuthState) => state.logout);

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
              <div>Alex Smith</div>
              <div className="text-sm text-gray-500">Administrator</div>
            </div>
          </Link>
        </div>
        <div className="flex-1 flex flex-col gap-2 border-y solid border-gray-200 p-5">
          <Link
            to="/dashboard"
            className={location?.pathname === '/dashboard' ? styles.active : ''}
          >
            <i className="fa-solid fa-table-cells-large"></i>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/competitions"
            className={location?.pathname === '/competitions' ? styles.active : ''}
          >
            <i className="fa-solid fa-trophy"></i>
            <span>Competitions</span>
          </Link>
          <Link to="/archive" className={location?.pathname === '/archive' ? styles.active : ''}>
            <i className="fa-solid fa-box-archive"></i>
            <span>Archive</span>
          </Link>
          <Link
            to="/profile/news"
            className={location?.pathname === '/profile/news' ? styles.active : ''}
          >
            <i className="fa-solid fa-newspaper"></i>
            <span>News</span>
          </Link>
        </div>
        <div className="p-5">
          <button
            className="w-full text-left"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
