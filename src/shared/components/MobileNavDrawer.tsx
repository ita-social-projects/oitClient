import { useLockBodyScroll } from '@hooks/useLockBodyScroll';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface MobileNavDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isAuthenticated: boolean;
}

export function MobileNavDrawer({ isOpen, onClose, isAuthenticated }: MobileNavDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['common']);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity w-full h-full cursor-default"
        onClick={onClose}
        aria-label={t('common.close', { defaultValue: 'Close' })}
      />

      <div className="relative w-[85vw] sm:w-96 h-full bg-white shadow-2xl flex flex-col transform transition-transform">
        <div className="flex items-center justify-end p-4">
          <button
            type="button"
            className="p-1 cursor-pointer text-gray-400 hover:text-gray-700"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex flex-col items-center py-4 gap-8 overflow-y-auto">
          <Link
            to="/"
            className={`text-gray-700 text-lg transition-colors hover:text-black ${location.pathname === '/' ? 'font-medium text-black' : ''}`}
            onClick={onClose}
          >
            {t('navbar.home')}
          </Link>
          <Link
            to="/news"
            className={`text-gray-700 text-lg transition-colors hover:text-black ${location.pathname === '/news' ? 'font-medium text-black' : ''}`}
            onClick={onClose}
          >
            {t('navbar.news')}
          </Link>
        </div>

        <div className="w-full h-px bg-gray-200 mt-6 mb-8" />

        <div className="flex flex-col items-center gap-6 px-6 pb-8 w-full">
          {!isAuthenticated && (
            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                className="btn select-none w-full py-3 text-base shadow-sm"
                onClick={() => handleNavigate('/signIn')}
              >
                {t('header.signIn')}
              </button>
              <button
                type="button"
                className="btn-regular select-none w-full py-3 text-base shadow-sm bg-white"
                onClick={() => handleNavigate('/registration')}
              >
                {t('header.signUp')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
