import { Outlet } from 'react-router-dom';

import { CabinetPanel } from './CabinetPanel/CabinetPanel';

export const CabinetLayout = () => {
  return (
    <div className="flex">
      <CabinetPanel />
      <div className="flex-1 bg-white">
        <Outlet />
      </div>
    </div>
  );
};
