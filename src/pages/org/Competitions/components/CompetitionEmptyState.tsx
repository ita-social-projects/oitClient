import { Plus, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface CompetitionEmptyStateProps {
  readonly isFiltered: boolean;
}

export const CompetitionEmptyState = ({ isFiltered }: CompetitionEmptyStateProps) => {
  const { t } = useTranslation('admin');

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Trophy size={24} className="text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-800">
        {t('competitions.emptyTitle')}
      </h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">
        {isFiltered
          ? t('competitions.emptyFiltered')
          : t('competitions.emptyDescription')}
      </p>
      <Link to="/profile/competitions/create" className="btn-regular mt-4 inline-flex items-center gap-2">
        <Plus size={16} />
        <span>{t('competitions.createButton')}</span>
      </Link>
    </div>
  );
};

export default CompetitionEmptyState;
