import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';

const NEWS_MANAGER_ROLES = ['ADMIN', 'ORG'];

export const useCanManageNews = () => {
  const role = useAuth((state: AuthState) => state.user?.role);
  return role ? NEWS_MANAGER_ROLES.includes(role) : false;
};