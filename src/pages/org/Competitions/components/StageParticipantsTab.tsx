import AdminSearchInput from '@components/AdminSearchInput';
import SimplePagination from '@shared/components/SimplePagination';
import type { ParticipationListItemResponse } from '@shared/models/enrollment';
import { enrollmentService } from '@shared/services/enrollmentService';
import { Users } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

export interface StageParticipantsTabProps {
  readonly competitionId: number;
  readonly stageId: number;
}

export const StageParticipantsTab: React.FC<StageParticipantsTabProps> = ({
  competitionId,
  stageId,
}) => {
  const { t } = useTranslation('admin');

  const [participants, setParticipants] = useState<ParticipationListItemResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const latestRequestIdRef = useRef(0);

  const fetchParticipants = useCallback(
    async (pageToFetch: number, query: string) => {
      const requestId = ++latestRequestIdRef.current;
      setLoading(true);
      try {
        const res = await enrollmentService.getStageParticipants(competitionId, stageId, {
          page: pageToFetch,
          size: pageSize,
          search: query.trim() || undefined,
        });

        if (requestId !== latestRequestIdRef.current) return;

        setParticipants(res.content || []);
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
      } catch (err: any) {
        if (requestId !== latestRequestIdRef.current) return;

        const msg = err?.response?.data?.message || t('stages.validation.loadError');
        toast.error(msg);
        setParticipants([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [competitionId, stageId, pageSize, t]
  );

  useEffect(() => {
    void fetchParticipants(page, debouncedSearch);
    return () => {
      latestRequestIdRef.current += 1;
    };
  }, [page, debouncedSearch, fetchParticipants]);

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
            {t('general.loading', { defaultValue: 'Завантаження...' })}
          </td>
        </tr>
      );
    }

    if (participants.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
            {t('enrollment.participants.empty')}
          </td>
        </tr>
      );
    }

    return participants.map((p, idx) => {
      const fullName = `${p.user?.firstName || ''} ${p.user?.surname || ''}`.trim() || '—';
      return (
        <tr key={p.participationId} className="hover:bg-gray-50 transition-colors">
          <td className="p-3 text-xs text-gray-400 font-medium text-center">
            {page * pageSize + idx + 1}
          </td>
          <td className="p-3 font-semibold text-gray-900">{fullName}</td>
          <td className="p-3 text-gray-600">{p.user?.email || '—'}</td>
          <td className="p-3 text-center">
            <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
              {p.studentId}
            </span>
          </td>
          <td className="p-3 text-right font-mono text-xs text-gray-400">
            #{p.participationId}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input & Total Count Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <AdminSearchInput
            search={search}
            setSearch={setSearch}
            setPage={setPage}
            placeholder={t('enrollment.participants.searchPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            <Users size={14} className="text-emerald-700" />
            <span>
              {t('enrollment.participants.total', {
                count: totalElements,
                defaultValue: `Загалом затверджених учасників: ${totalElements}`,
              })}
            </span>
          </span>
        </div>
      </div>

      {/* Participants Table */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-3 w-16 text-center">{t('enrollment.participants.columns.number')}</th>
              <th className="p-3">{t('enrollment.participants.columns.name')}</th>
              <th className="p-3">{t('enrollment.participants.columns.email')}</th>
              <th className="p-3 text-center">{t('enrollment.participants.columns.studentId')}</th>
              <th className="p-3 text-right">{t('enrollment.participants.columns.participationId')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <SimplePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default StageParticipantsTab;
