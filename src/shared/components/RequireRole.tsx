import type { UserRole } from '@shared/models/user';
import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type RequireRoleProps = {
  roles: readonly UserRole[];
  children: ReactNode;
};

export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const userRole = useAuth((state: AuthState) => state.user?.role);

  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to="/news" replace />;
  }

  return <>{children}</>;
};