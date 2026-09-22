import AdminSearchInput from '@components/AdminSearchInput.tsx';
import SimplePagination from '@components/SimplePagination.tsx';
import type { CompetitionResponse, CompetitionStatus } from '@shared/models/competition';
import { competitionService } from '@shared/services/competitionService.ts';
import { AlertCircle, Plus, RefreshCw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import CompetitionCard from './components/CompetitionCard';
import CompetitionFilters from './components/CompetitionFilters';

export default function CompetitionList() {
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
        const res = await competitionService.getCompetitions({
          page,
          size: 8,
          title: debouncedSearch.trim() || undefined,
          statuses: appliedStatuses.length > 0 ? appliedStatuses : undefined,
          dateStart: appliedDateFrom ? `${appliedDateFrom}T00:00:00Z` : undefined,
          dateFinish: appliedDateTo ? `${appliedDateTo}T23:59:59Z` : undefined,
        });

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
    [page, debouncedSearch, appliedStatuses, appliedDateFrom, appliedDateTo, t],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadCompetitions(controller.signal);
    return () => controller.abort();
  }, [loadCompetitions]);

  const handleApplyFilters = (dateFrom: string, dateTo: string, statuses: CompetitionStatus[]) => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedStatuses(statuses);
    setPage(0);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
            <Trophy className="text-primary-100" size={24} />
            <span>{t('competitions.title')}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('competitions.subtitle')}
          </p>
        </div>

        <Link
          to="/profile/competitions/create"
          className="btn-regular inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>{t('competitions.createButton')}</span>
        </Link>
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
          <CompetitionFilters
            appliedDateFrom={appliedDateFrom}
            appliedDateTo={appliedDateTo}
            appliedStatuses={appliedStatuses}
            onApply={handleApplyFilters}
          />

          <button
            type="button"
            onClick={() => loadCompetitions()}
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
            onClick={() => loadCompetitions()}
            className="ml-auto text-xs underline font-medium hover:text-red-900 cursor-pointer"
          >
            {t('general.retry')}
          </button>
        </div>
      )}

      {loading ? (
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
                  <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Trophy size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            {t('competitions.emptyTitle')}
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {debouncedSearch || appliedStatuses.length > 0 || appliedDateFrom || appliedDateTo
              ? t('competitions.emptyFiltered')
              : t('competitions.emptyDescription')}
          </p>
          <Link to="/profile/competitions/create" className="btn-regular mt-4 inline-flex items-center gap-2">
            <Plus size={16} />
            <span>{t('competitions.createButton')}</span>
          </Link>
        </div>
      ) : (
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
