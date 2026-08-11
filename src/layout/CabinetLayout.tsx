import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { CabinetPanel } from '../pages/CabinetPanel/CabinetPanel.tsx';
import { Header } from '../layout/Header';

export const CabinetLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Header />
      <div className="flex">
        <CabinetPanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <div className="flex-1 bg-white min-w-0 flex flex-col relative">
          <div className="md:hidden flex items-center p-4 border-b border-gray-200">
            <button onClick={() => setIsDrawerOpen(true)} className="text-gray-700 px-2">
              <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
            </button>
          </div>          
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};
