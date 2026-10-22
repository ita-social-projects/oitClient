import { Calendar } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface YearFilterSelectProps {
  readonly selectedYear: number | undefined;
  readonly onSelectYear: (year: number | undefined) => void;
  readonly startYear?: number;
  readonly endYear?: number;
}

export const YearFilterSelect: React.FC<YearFilterSelectProps> = ({
  selectedYear,
  onSelectYear,
  startYear = 2020,
  endYear = new Date().getFullYear() + 1,
}) => {
  const { t } = useTranslation('admin');

  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = endYear; y >= startYear; y--) {
      list.push(y);
    }
    return list;
  }, [startYear, endYear]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'all' || !val) {
      onSelectYear(undefined);
    } else {
      onSelectYear(Number(val));
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <Calendar size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
      <select
        aria-label={t('competitions.yearLabel')}
        value={selectedYear ?? 'all'}
        onChange={handleChange}
        className="pl-8.5 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-xs text-gray-700 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-primary-100 focus:border-primary-100 cursor-pointer appearance-none"
      >
        <option value="all">{t('competitions.allYears')}</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 pointer-events-none text-gray-400 text-xs">
        ▼
      </div>
    </div>
  );
};

export default YearFilterSelect;
