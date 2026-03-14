import { Filter, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ArchiveFilters({
  searchQuery,
  selectedLevel,
  selectedYear,
  years,
  onSearchChange,
  onLevelChange,
  onYearChange,
}: {
  searchQuery: string;
  selectedLevel: string;
  selectedYear: string;
  years: number[];
  onSearchChange: (v: string) => void;
  onLevelChange: (v: string) => void;
  onYearChange: (v: string) => void;
}) {
  const { t } = useTranslation('competition');


  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder={t('archive.searchPlaceholder')}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <select
            value={selectedLevel}
            onChange={e => onLevelChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg appearance-none bg-white"
          >
            <option value="all">{t('archive.allLevels')}</option>
            <option value="CITY">{t('archive.city')}</option>
            <option value="REGION">{t('archive.regional')}</option>
            <option value="NATIONAL">{t('archive.national')}</option>
            <option value="OPEN">{t('archive.open')}</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <select
            value={selectedYear}
            onChange={e => onYearChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg appearance-none bg-white"
          >
            <option value="all">{t('archive.allYears')}</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
