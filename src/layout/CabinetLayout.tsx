import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../layout/Header';
import { CabinetPanel } from '../pages/CabinetPanel/CabinetPanel.tsx';

export const CabinetLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useTranslation('common');

  return (
    <>
      <Header />
      <div className="flex flex-1 bg-white overflow-hidden min-h-0">
        <CabinetPanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col relative overflow-y-auto">
          <div className="lg:hidden flex items-center p-4 border-b border-gray-200 shrink-0">
            <button
              type="button"
              aria-label={t('general.open')}
              onClick={() => setIsDrawerOpen(true)}
              className="text-gray-700 px-2"
            >
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
