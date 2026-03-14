import { useEffect, useState } from 'react';
import ArchiveFilters from './components/ArchiveFilters.tsx';
import OlympiadCard from './components/OlympiadCard.tsx';
import { useTranslation } from 'react-i18next';
import type { Competition, CompetitionFilters } from '@shared/models/CompetitionArchive.types.ts';
import { getCompetitions, getFilters } from '@services/competitionService.ts';

export function CompetitionArchive() {
  const { t } = useTranslation('competition');

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filters, setFilters] = useState<CompetitionFilters | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    getFilters().then(setFilters);
  }, []);

  useEffect(() => {
    getCompetitions({
      search: debouncedSearch,
      level: selectedLevel,
      year: selectedYear,
      page: page,
    }).then(res => {
      setCompetitions(res.content);
      setTotalPages(res.totalPages);
    });
  }, [debouncedSearch, selectedLevel, selectedYear, page]);

  const years = filters?.years ?? [];

  return (
    <>
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
          onSearchChange={v => {
            setSearchQuery(v);
            setPage(0);
          }}
          onLevelChange={v => {
            setSelectedLevel(v);
            setPage(0);
          }}
          onYearChange={v => {
            setSelectedYear(v);
            setPage(0);
          }}
        />

        <div className="mb-4 text-sm text-[var(--color-text-secondary)]">
          {t('archive.found', { count: competitions.length })}
        </div>

        {competitions.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-10 text-center">
            <p className="text-[var(--color-text-secondary)] text-lg">{t('archive.noOlympiads')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {competitions.map(o => (
              <OlympiadCard key={o.id} olympiad={o} />
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-2 border rounded ${page === i ? 'bg-blue-500 text-white' : ''}`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage(page + 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}