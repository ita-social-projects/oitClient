import LangButton from '@components/LangButton/LangButton';
import { Outlet } from 'react-router-dom';

import styles from './Auth.module.scss';

export function AuthLayout() {
  return (
    <div className={`relative ${styles.page}`}>
      <Outlet />
      <LangButton className="btn-regular absolute top-4 right-4 w-[180px]" />
    </div>
  );
}
