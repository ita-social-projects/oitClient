import Input from '@shared/components/Input';
import type { CompetitionStatus } from '@shared/models/competition';
import { COMPETITION_STATUSES } from '@shared/models/competition';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type CompetitionFiltersProps = Readonly<{
  appliedDateFrom: string;
  appliedDateTo: string;
  appliedStatuses: CompetitionStatus[];
  onApply: (dateFrom: string, dateTo: string, statuses: CompetitionStatus[]) => void;
}>;

export default function CompetitionFilters({
  appliedDateFrom,
  appliedDateTo,
  appliedStatuses,
  onApply,
}: CompetitionFiltersProps) {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDateFrom, setPendingDateFrom] = useState(appliedDateFrom);
  const [pendingDateTo, setPendingDateTo] = useState(appliedDateTo);
  const [pendingStatuses, setPendingStatuses] = useState<CompetitionStatus[]>(appliedStatuses);

  const toggleOpen = () => {
    if (!isOpen) {
      setPendingDateFrom(appliedDateFrom);
      setPendingDateTo(appliedDateTo);
      setPendingStatuses(appliedStatuses);
    }
    setIsOpen(prev => !prev);
  };

  const toggleStatus = (status: CompetitionStatus) => {
    setPendingStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleApply = () => {
    onApply(pendingDateFrom, pendingDateTo, pendingStatuses);
    setIsOpen(false);
  };

  const handleReset = () => {
    setPendingDateFrom('');
    setPendingDateTo('');
    setPendingStatuses([]);
    onApply('', '', []);
    setIsOpen(false);
  };

  const activeFiltersCount =
    (appliedDateFrom ? 1 : 0) + (appliedDateTo ? 1 : 0) + appliedStatuses.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <Filter size={16} className="text-gray-500" />
        <span>{t('filters.button')}</span>
        {activeFiltersCount > 0 && (
          <span className="bg-primary-100 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-20">
          <div className="mb-4 flex flex-col gap-3">
            <div>
              <label htmlFor="comp-date-from" className="block text-xs font-semibold text-gray-600 mb-1">
                {t('filters.dateFromLabel')}
              </label>
              <Input
                id="comp-date-from"
                type="date"
                value={pendingDateFrom}
                onChange={e => setPendingDateFrom(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>

            <div>
              <label htmlFor="comp-date-to" className="block text-xs font-semibold text-gray-600 mb-1">
                {t('filters.dateToLabel')}
              </label>
              <Input
                id="comp-date-to"
                type="date"
                value={pendingDateTo}
                onChange={e => setPendingDateTo(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              {t('filters.statuses')}
            </label>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
              {COMPETITION_STATUSES.map(status => {
                const isSelected = pendingStatuses.includes(status);
                return (
                  <label
                    key={status}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 text-primary-100 font-medium' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleStatus(status)}
                    />
                    <span
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary-100 bg-primary-100' : 'border-gray-400 bg-white'
                        }`}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M1.5 5L4 7.5L8.5 2"
                            stroke="white"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="text-xs">
                      {t(`competitionStatus.${status}`)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
            >
              {t('filters.reset')}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1.5 rounded-md bg-primary-100 text-white text-xs font-medium hover:bg-blue-600 transition-colors cursor-pointer"
            >
              {t('filters.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
