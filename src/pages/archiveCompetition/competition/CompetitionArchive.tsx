import { useMemo, useState } from 'react';
import { extractYears, filterOlympiads } from './CompetitionArchive.utils.ts';
import { ARCHIVED_OLYMPIADS } from './ComponentArchive.constants.ts';
import ArchiveFilters from './components/ArchiveFilters.tsx';
import OlympiadCard from './components/OlympiadCard.tsx';
import { useTranslation } from 'react-i18next';

export function CompetitionArchive() {
  const { t } = useTranslation('competition');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const years = useMemo(() => extractYears(ARCHIVED_OLYMPIADS), []);

  const filteredOlympiads = useMemo(
    () => filterOlympiads(ARCHIVED_OLYMPIADS, searchQuery, selectedLevel, selectedYear),
    [searchQuery, selectedLevel, selectedYear],
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[var(--color-text)] mb-2">{t('archive.title')}</h1>
        <p className="text-[var(--color-text-secondary)]">{t('archive.subtitle')}</p>
      </div>

      <ArchiveFilters
        searchQuery={searchQuery}
        selectedLevel={selectedLevel}
        selectedYear={selectedYear}
        years={years}
        onSearchChange={setSearchQuery}
        onLevelChange={setSelectedLevel}
        onYearChange={setSelectedYear}
      />

      <div className="mb-4 text-sm text-[var(--color-text-secondary)]">
        {t('archive.found', { count: filteredOlympiads.length })}
      </div>

      {filteredOlympiads.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-10 text-center">
          <p className="text-[var(--color-text-secondary)] text-lg">{t('archive.noOlympiads')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOlympiads.map(o => (
            <OlympiadCard key={o.id} olympiad={o} />
          ))}
        </div>
      )}
    </div>
  );
}