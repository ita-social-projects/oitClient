import AdminSearchInput from '@components/AdminSearchInput';
import { Checkbox } from '@mui/joy';
import SimplePagination from '@shared/components/SimplePagination';
import type { ApplicationListItemResponse } from '@shared/models/enrollment';
import { enrollmentService } from '@shared/services/enrollmentService';
import { showBatchToast } from '@utils/toastUtils';
import { Check, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import EnrollmentStatusBadge from './EnrollmentStatusBadge';
import RejectReasonModal from './RejectReasonModal';

export interface StageApplicationsTabProps {
  readonly competitionId: number;
  readonly stageId: number;
  readonly isArchived?: boolean;
}

const formatDate = (isoStr: string, locale = 'uk-UA'): string => {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
};

export const StageApplicationsTab: React.FC<StageApplicationsTabProps> = ({
  competitionId,
  stageId,
  isArchived = false,
}) => {
  const { t, i18n } = useTranslation('admin');

  const [applications, setApplications] = useState<ApplicationListItemResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModalState, setRejectModalState] = useState<{
    isOpen: boolean;
    isBatch: boolean;
    targetId?: number;
    count?: number;
    isLoading: boolean;
  }>({
    isOpen: false,
    isBatch: false,
    isLoading: false,
  });

  // 300ms debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await enrollmentService.getStageApplications(competitionId, stageId, {
        page,
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
      });
      setApplications(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch {
      setApplications([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [competitionId, stageId, page, pageSize, debouncedSearch]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Selection handlers
  const allVisibleSelected =
    applications.length > 0 && applications.every((app) => selectedIds.includes(app.applicationId));

  const isIndeterminate =
    selectedIds.length > 0 &&
    !allVisibleSelected &&
    applications.some((app) => selectedIds.includes(app.applicationId));

  const toggleSelectAll = () => {
    const visibleIds = new Set(applications.map((app) => app.applicationId));

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Accept
  const handleSingleAccept = async (appId: number) => {
    setActionLoading(true);
    try {
      await enrollmentService.acceptApplication(appId);
      toast.success(t('enrollment.applications.acceptedSuccess'));
      setSelectedIds((prev) => prev.filter((id) => id !== appId));
      await loadApplications();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('stages.validation.loadError');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Batch Accept
  const handleBatchAccept = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await enrollmentService.acceptApplicationsBatch(selectedIds);
      showBatchToast(res, t, 'enrollment.applications.batchAcceptedSummary');

      setSelectedIds([]);
      await loadApplications();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('stages.validation.loadError');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject confirm from modal (single or batch)
  const handleRejectConfirm = async (reason: string) => {
    setRejectModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (rejectModalState.isBatch) {
        const res = await enrollmentService.rejectApplicationsBatch(selectedIds, reason || undefined);
        showBatchToast(res, t, 'enrollment.applications.batchRejectedSummary');
        setSelectedIds([]);
      } else if (rejectModalState.targetId) {
        await enrollmentService.rejectApplication(rejectModalState.targetId, reason || undefined);
        toast.success(t('enrollment.applications.rejectedSuccess'));
        setSelectedIds((prev) => prev.filter((id) => id !== rejectModalState.targetId));
      }

      setRejectModalState({ isOpen: false, isBatch: false, isLoading: false });
      await loadApplications();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('stages.validation.loadError');
      toast.error(msg);
      setRejectModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={isArchived ? 4 : 6} className="p-8 text-center text-sm text-gray-500">
            {t('general.loading', { defaultValue: 'Завантаження...' })}
          </td>
        </tr>
      );
    }

    if (applications.length === 0) {
      return (
        <tr>
          <td colSpan={isArchived ? 4 : 6} className="p-8 text-center text-sm text-gray-500">
            {t('enrollment.applications.empty')}
          </td>
        </tr>
      );
    }

    return applications.map((app) => {
      const isSelected = selectedIds.includes(app.applicationId);
      const fullName = `${app.user.firstName} ${app.user.surname}`;

      return (
        <tr
          key={app.applicationId}
          className={`hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-emerald-50/40' : ''
          }`}
        >
          {!isArchived && (
            <td className="p-3 text-center">
              <div className="flex items-center justify-center">
                <Checkbox
                  size="sm"
                  color="success"
                  checked={isSelected}
                  onChange={() => toggleSelectOne(app.applicationId)}
                  slotProps={{
                    input: { 'aria-label': fullName },
                  }}
                />
              </div>
            </td>
          )}
          <td className="p-3 font-medium text-gray-900">{fullName}</td>
          <td className="p-3 text-gray-600">{app.user.email}</td>
          <td className="p-3 text-gray-500 whitespace-nowrap">
            {formatDate(app.issuedAt, i18n.language)}
          </td>
          <td className="p-3">
            <EnrollmentStatusBadge status={app.status} />
          </td>
          {!isArchived && (
            <td className="p-3 text-right whitespace-nowrap">
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleSingleAccept(app.applicationId)}
                  title={t('enrollment.applications.accept')}
                  className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-600 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    setRejectModalState({
                      isOpen: true,
                      isBatch: false,
                      targetId: app.applicationId,
                      isLoading: false,
                    })
                  }
                  title={t('enrollment.applications.reject')}
                  className="p-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input & Info */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <AdminSearchInput
            search={search}
            setSearch={setSearch}
            setPage={setPage}
            placeholder={t('enrollment.applications.searchPlaceholder')}
          />
        </div>

        {totalElements > 0 && (
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {t('pagination.total', { count: totalElements, defaultValue: `Усього: ${totalElements}` })}
          </span>
        )}
      </div>

      {/* Batch Actions Toolbar */}
      {selectedIds.length > 0 && !isArchived && (
        <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-fadeIn flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-emerald-800">
              {t('enrollment.applications.batchSelected', {
                count: selectedIds.length,
                defaultValue: `Обрано: ${selectedIds.length}`,
              })}
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              {t('enrollment.applications.clearSelection', { defaultValue: 'Скинути вибір' })}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleBatchAccept}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              <span>{t('enrollment.applications.batchAccept', { count: selectedIds.length })}</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() =>
                setRejectModalState({
                  isOpen: true,
                  isBatch: true,
                  count: selectedIds.length,
                  isLoading: false,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={14} />
              <span>{t('enrollment.applications.batchReject', { count: selectedIds.length })}</span>
            </button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {!isArchived && (
                <th className="p-3 w-10 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      size="sm"
                      color="success"
                      checked={allVisibleSelected}
                      indeterminate={isIndeterminate}
                      onChange={toggleSelectAll}
                      disabled={applications.length === 0}
                      title={allVisibleSelected ? 'Зняти вибір' : 'Обрати всі'}
                      slotProps={{
                        input: { 'aria-label': t('enrollment.applications.selectAll', { defaultValue: 'Обрати всі' }) },
                      }}
                    />
                  </div>
                </th>
              )}
              <th className="p-3">{t('enrollment.applications.columns.user')}</th>
              <th className="p-3">{t('enrollment.applications.columns.email')}</th>
              <th className="p-3">{t('enrollment.applications.columns.date')}</th>
              <th className="p-3">{t('enrollment.applications.columns.status')}</th>
              {!isArchived && <th className="p-3 text-right">{t('enrollment.applications.columns.actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={rejectModalState.isOpen}
        isBatch={rejectModalState.isBatch}
        count={rejectModalState.count}
        isLoading={rejectModalState.isLoading}
        onClose={() => setRejectModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};

export default StageApplicationsTab;
