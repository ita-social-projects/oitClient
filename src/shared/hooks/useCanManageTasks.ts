import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';

const TASK_MANAGER_ROLES = new Set(['ADMIN', 'ORG']);

export const useCanManageTasks = () => {
  const role = useAuth((state: AuthState) => state.user?.role);
  return role ? TASK_MANAGER_ROLES.has(role) : false;
};
