import useAuth from '@shared/state/authState';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { t } = useTranslation('profile');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full w-10 h-10 bg-primary-100 flex items-center justify-center text-white font-medium"
        aria-label="User menu"
      >
        {user.firstName?.[0]?.toUpperCase() ?? '?'}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30 text-black">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-sm text-gray-500">{t(`roles.${user.role}`)}</div>
          </div>
          <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
            {t('profile')}
          </Link>
          <button
            type="button"
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
            onClick={() => {
              logout();
              setOpen(false);
              navigate('/');
            }}
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}