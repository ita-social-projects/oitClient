import { Outlet } from 'react-router-dom';

import styles from './Auth.module.scss';

export function AuthLayout() {
  return (
    <div className={styles.page}>
      <Outlet />
    </div>
  );
}
