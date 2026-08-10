import { Outlet } from 'react-router-dom';

import { CabinetPanel } from '../pages/CabinetPanel/CabinetPanel.tsx';
import { Header } from '../layout/Header';

export const CabinetLayout = () => {
  return (
    <>
      <Header />
      <div className="flex">
        <CabinetPanel />
        <div className="flex-1 bg-white">
          <Outlet />
        </div>
      </div>
    </>
  );
};
