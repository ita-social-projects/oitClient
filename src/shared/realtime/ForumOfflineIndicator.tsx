import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import { useTranslation } from 'react-i18next';

import { useForumRealtime } from './useForumRealtime';

const INDICATOR_STYLES = {
  connecting: 'border-blue-200 bg-blue-50 text-blue-900',
  reconnecting: 'border-amber-200 bg-amber-50 text-amber-900',
  offline: 'border-rose-200 bg-rose-50 text-rose-900',
  disconnected: 'border-amber-200 bg-amber-50 text-amber-900',
} as const;

export const ForumOfflineIndicator = () => {
  const { t } = useTranslation('forum');
  const isAuthenticated = useAuth((state: AuthState) => state.isAuthenticated);
  const { status } = useForumRealtime();

  if (!isAuthenticated || status === 'idle' || status === 'connected') {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 top-0 z-[100] border-b px-4 py-2 text-center text-sm font-medium ${INDICATOR_STYLES[status]}`}
    >
      {t(`realtime.${status}`)}
    </div>
  );
};
