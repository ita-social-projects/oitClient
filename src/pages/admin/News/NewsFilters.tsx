import type { NewsStatus } from '@shared/models/news';
import { NEWS_STATUSES } from '@shared/models/news';
import Input from '@shared/components/Input';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type NewsFiltersProps = Readonly<{
  appliedDateFrom: string;
  appliedDateTo: string;
  appliedStatuses: NewsStatus[];
  onApply: (dateFrom: string, dateTo: string, statuses: NewsStatus[]) => void;
}>;

export default function NewsFilters({ appliedDateFrom, appliedDateTo, appliedStatuses, onApply }: NewsFiltersProps) {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDateFrom, setPendingDateFrom] = useState(appliedDateFrom);
  const [pendingDateTo, setPendingDateTo] = useState(appliedDateTo);
  const [pendingStatuses, setPendingStatuses] = useState<NewsStatus[]>(appliedStatuses);

  const toggleOpen = () => {
    if (!isOpen) {
      setPendingDateFrom(appliedDateFrom);
      setPendingDateTo(appliedDateTo);
      setPendingStatuses(appliedStatuses);
    }
    setIsOpen(prev => !prev);
  };

  const toggleStatus = (status: NewsStatus) => {
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

  const activeFiltersCount = (appliedDateFrom ? 1 : 0) + (appliedDateTo ? 1 : 0) + appliedStatuses.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="px-3 py-2 rounded-md border border-gray-400 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2"
      >
        <Filter size={16} />
        {t('news.filters.button')}
        {activeFiltersCount > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded-md shadow-lg p-4 z-10">
          <div className="mb-4 flex flex-col gap-3">
            <div>
              <label htmlFor="news-date-from" className="block text-sm font-medium mb-1">
                {t('news.filters.dateFromLabel')}
              </label>
              <Input
                id="news-date-from"
                type="date"
                value={pendingDateFrom}
                onChange={e => setPendingDateFrom(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>

            <div>
              <label htmlFor="news-date-to" className="block text-sm font-medium mb-1">
                {t('news.filters.dateToLabel')}
              </label>
              <Input
                id="news-date-to"
                type="date"
                value={pendingDateTo}
                onChange={e => setPendingDateTo(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {t('news.filters.statusLabel')}
            </label>
            <div className="flex flex-col gap-1">
              {NEWS_STATUSES.map(status => {
                const isSelected = pendingStatuses.includes(status);
                return (
                  <label
                    key={status}
                    className={`flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleStatus(status)}
                    />
                    <span
                      className={`w-[18px] h-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'
                        }`}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-medium">{t(`newsStatus.${status}`)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-sm text-gray-500 hover:underline"
            >
              {t('news.filters.reset')}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600"
            >
              {t('news.filters.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}