import AdminSearchInput from '@components/AdminSearchInput.tsx';
import SimplePagination from '@components/SimplePagination.tsx';
import type { CompetitionResponse, CompetitionStatus } from '@shared/models/competition';
import { competitionService } from '@shared/services/competitionService.ts';
import { AlertCircle, Archive, ArrowLeft, Plus, RefreshCw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import CompetitionCard from './components/CompetitionCard';
import CompetitionEmptyState from './components/CompetitionEmptyState';
import CompetitionFilters from './components/CompetitionFilters';
import YearFilterSelect from './components/YearFilterSelect';

interface CompetitionListProps {
  readonly isArchive?: boolean;
}

export default function CompetitionList({ isArchive = false }: CompetitionListProps) {
  const { t } = useTranslation('admin');

  const [competitions, setCompetitions] = useState<CompetitionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [appliedStatuses, setAppliedStatuses] = useState<CompetitionStatus[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadCompetitions = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (isArchive) {
          let dateStart: string | undefined;
          let dateFinish: string | undefined;

          if (selectedYear) {
            dateStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0)).toISOString();
            dateFinish = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999)).toISOString();
          }

          res = await competitionService.getArchivedCompetitions({
            page,
            size: 8,
            title: debouncedSearch.trim() || undefined,
            dateStart,
            dateFinish,
          });
        } else {
          res = await competitionService.getCompetitions({
            page,
            size: 8,
            title: debouncedSearch.trim() || undefined,
            statuses: appliedStatuses.length > 0 ? appliedStatuses : undefined,
            dateStart: appliedDateFrom
              ? new Date(`${appliedDateFrom}T00:00:00`).toISOString()
              : undefined,
            dateFinish: appliedDateTo
              ? new Date(`${appliedDateTo}T23:59:59`).toISOString()
              : undefined,
          });
        }

        if (signal?.aborted) return;
        setCompetitions(Array.isArray(res.content) ? res.content : []);
        setTotalPages(res.totalPages || 0);
      } catch {
        if (signal?.aborted) return;
        setError(t('competitions.loadError'));
        setCompetitions([]);
        setTotalPages(0);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [isArchive, page, debouncedSearch, selectedYear, appliedStatuses, appliedDateFrom, appliedDateTo, t],
  );

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCompetitions(controller.signal);
    return () => controller.abort();
  }, [loadCompetitions, reloadKey]);

  const handleApplyFilters = (dateFrom: string, dateTo: string, statuses: CompetitionStatus[]) => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedStatuses(statuses);
    setPage(0);
  };

  const handleSelectYear = (year: number | undefined) => {
    setSelectedYear(year);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedYear(undefined);
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setAppliedStatuses([]);
    setPage(0);
  };

  const isFiltered = isArchive
    ? Boolean(debouncedSearch.trim() || selectedYear !== undefined)
    : Boolean(debouncedSearch || appliedStatuses.length > 0 || appliedDateFrom || appliedDateTo);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
            {isArchive ? (
              <Archive className="text-primary-100" size={24} />
            ) : (
              <Trophy className="text-primary-100" size={24} />
            )}
            <span>{isArchive ? t('competitions.archiveTitle') : t('competitions.title')}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isArchive ? t('competitions.archiveSubtitle') : t('competitions.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isArchive ? (
            <Link
              to="/profile/competitions"
              className="btn-regular inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <ArrowLeft size={16} />
              <span>{t('competitions.backToActive')}</span>
            </Link>
          ) : (
            <>
              <Link
                to="/profile/competitions/archive"
                className="btn-regular inline-flex items-center gap-2"
                title={t('competitions.goToArchive')}
              >
                <Archive size={18} />
                <span>{t('competitions.goToArchive')}</span>
              </Link>

              <Link
                to="/profile/competitions/create"
                className="btn-regular inline-flex items-center gap-2"
              >
                <Plus size={18} />
                <span>{t('competitions.createButton')}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
        <div className="flex-1">
          <AdminSearchInput
            search={search}
            setSearch={setSearch}
            setPage={setPage}
            placeholder={t('competitions.searchPlaceholder')}
          />
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isArchive ? (
            <YearFilterSelect
              selectedYear={selectedYear}
              onSelectYear={handleSelectYear}
            />
          ) : (
            <CompetitionFilters
              appliedDateFrom={appliedDateFrom}
              appliedDateTo={appliedDateTo}
              appliedStatuses={appliedStatuses}
              onApply={handleApplyFilters}
            />
          )}

          <button
            type="button"
            onClick={handleReload}
            title={t('general.refresh')}
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={handleReload}
            className="ml-auto text-xs underline font-medium hover:text-red-900 cursor-pointer"
          >
            {t('general.retry')}
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="border border-gray-200 rounded-xl p-5 bg-white animate-pulse flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 w-24 bg-gray-200 rounded-full" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                  {!isArchive && <div className="h-8 w-20 bg-gray-200 rounded-lg" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && competitions.length === 0 && (
        isArchive ? (
          <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Archive size={24} />
            </div>
            <h3 className="font-semibold text-base text-gray-800 mb-1">
              {isFiltered
                ? t('competitions.archiveEmptyFiltered')
                : t('competitions.archiveEmpty')}
            </h3>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 text-xs text-primary-100 hover:underline font-medium cursor-pointer"
              >
                {t('competitions.resetFilters')}
              </button>
            )}
          </div>
        ) : (
          <CompetitionEmptyState isFiltered={isFiltered} />
        )
      )}

      {!loading && competitions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitions.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
