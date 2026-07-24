import { Outlet } from 'react-router-dom';

import { CabinetPanel } from './CabinetPanel/CabinetPanel';
import { Header } from "../layout/Header";

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
