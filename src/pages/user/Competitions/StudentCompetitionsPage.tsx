import { usePendingInvitationsCount } from '@shared/hooks/usePendingInvitationsCount';
import { Compass, Mail, Trophy } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { StudentCompetitionEnrollmentTab } from './StudentCompetitionEnrollmentTab';
import { StudentInvitationsTab } from './StudentInvitationsTab';

export type MainTabType = 'enrollment' | 'invitations';

export const StudentCompetitionsPage: React.FC = () => {
  const { t } = useTranslation(['profile', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();
  const { pendingCount } = usePendingInvitationsCount();

  const currentTab: MainTabType =
    searchParams.get('tab') === 'invitations' ? 'invitations' : 'enrollment';

  const handleTabChange = (tab: MainTabType) => {
    if (tab === 'enrollment') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('tab');
      setSearchParams(nextParams);
    } else {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tab', 'invitations');
      setSearchParams(nextParams);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t('studentEnrollment.title')}
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t('studentEnrollment.subtitle')}
        </p>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {/* Tab: Available Competitions */}
          <button
            type="button"
            onClick={() => handleTabChange('enrollment')}
            className={`inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition cursor-pointer select-none ${
              currentTab === 'enrollment'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('studentInvitations.tabs.enrollment')}</span>
          </button>

          {/* Tab: Invitations */}
          <button
            type="button"
            onClick={() => handleTabChange('invitations')}
            className={`inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition cursor-pointer select-none ${
              currentTab === 'invitations'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{t('studentInvitations.tabs.invitations')}</span>
            {pendingCount > 0 && (
              <span
                data-testid="tab-pending-badge"
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-amber-500 text-white ml-1"
              >
                {pendingCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {currentTab === 'enrollment' ? (
          <StudentCompetitionEnrollmentTab />
        ) : (
          <StudentInvitationsTab />
        )}
      </div>
    </div>
  );
};

export default StudentCompetitionsPage;
