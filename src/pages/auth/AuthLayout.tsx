import LangButton from '@components/LangButton/LangButton';
import { Outlet } from 'react-router-dom';

import styles from './Auth.module.scss';

export function AuthLayout() {
  return (
    <div
      className={`relative ${styles.page} flex items-center bg-linear-to-br from-blue-50 to-purple-50`}
    >
      <Outlet />
      <LangButton className="btn-regular absolute top-4 right-4 w-[180px]" />
    </div>
  );
}
