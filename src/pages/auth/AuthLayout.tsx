import LangButton from '@components/LangButton';
import { Outlet } from 'react-router-dom';

import styles from './Auth.module.scss';

export function AuthLayout() {
  return (
    <div
      className={`relative ${styles.page} flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 px-4 sm:px-8 py-16 sm:py-0`}
    >
      <Outlet />
      <LangButton className="btn-regular absolute top-2 right-2 sm:top-4 sm:right-4 w-[140px] sm:w-[180px]" />
    </div>
  );
}
