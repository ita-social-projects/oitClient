import { Outlet } from 'react-router-dom';

import { Header } from './Header.tsx';

export function MainLayout() {
  return (
    <>
      <Header />
      <main className="bg-white px-8 py-12">
        <Outlet />
      </main>
    </>
  );
}
