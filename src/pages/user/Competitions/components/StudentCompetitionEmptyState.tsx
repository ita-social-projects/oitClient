import { RotateCcw, SearchX, Trophy } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface StudentCompetitionEmptyStateProps {
  isSearch: boolean;
  onResetSearch?: () => void;
}

export const StudentCompetitionEmptyState: React.FC<StudentCompetitionEmptyStateProps> = ({
  isSearch,
  onResetSearch,
}) => {
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
      <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        {isSearch ? <SearchX className="w-7 h-7" /> : <Trophy className="w-7 h-7" />}
      </div>

      <h3 className="text-base font-semibold text-gray-800 max-w-md">
        {isSearch
          ? t('studentEnrollment.empty.noResults')
          : t('studentEnrollment.empty.noCompetitions')}
      </h3>

      {isSearch && onResetSearch && (
        <button
          type="button"
          onClick={onResetSearch}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('studentEnrollment.empty.resetSearch')}</span>
        </button>
      )}
    </div>
  );
};

export default StudentCompetitionEmptyState;

