import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import React from 'react';

import CompetitionList from '../org/Competitions/CompetitionList';
import StudentCompetitionsPage from '../user/Competitions/StudentCompetitionsPage';

export const CompetitionsPageDispatcher: React.FC = () => {
  const user = useAuth((state: AuthState) => state.user);

  if (user?.role === 'USER') {
    return <StudentCompetitionsPage />;
  }

  return <CompetitionList />;
};

export default CompetitionsPageDispatcher;

