import { Outlet } from 'react-router-dom';

import { Header } from '../pages/public/header/Header.tsx';

export function MainLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
