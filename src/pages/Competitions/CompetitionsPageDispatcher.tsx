import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import React from 'react';

import CompetitionList from '../org/Competitions/CompetitionList';
import StudentCompetitionEnrollmentPage from '../user/Competitions/StudentCompetitionEnrollmentPage';

export const CompetitionsPageDispatcher: React.FC = () => {
  const user = useAuth((state: AuthState) => state.user);

  if (user?.role === 'USER') {
    return <StudentCompetitionEnrollmentPage />;
  }

  return <CompetitionList />;
};

export default CompetitionsPageDispatcher;

