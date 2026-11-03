import AdminSearchInput from '@components/AdminSearchInput';
import { ConfirmModal } from '@components/ConfirmModal';
import SimplePagination from '@shared/components/SimplePagination';
import type { InvitationListItemResponse } from '@shared/models/enrollment';
import { enrollmentService } from '@shared/services/enrollmentService';
import { UserPlus, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import EnrollmentStatusBadge from './EnrollmentStatusBadge';
import SendInvitationsModal from './SendInvitationsModal';

export interface StageInvitationsTabProps {
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

export const StageInvitationsTab: React.FC<StageInvitationsTabProps> = ({
  competitionId,
  stageId,
  isArchived = false,
}) => {
  const { t, i18n } = useTranslation('admin');

  const [invitations, setInvitations] = useState<InvitationListItemResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    targetId: number | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    targetId: null,
    isLoading: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await enrollmentService.getStageInvitations(competitionId, stageId, {
        page,
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
      });
      setInvitations(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch {
      setInvitations([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [competitionId, stageId, page, pageSize, debouncedSearch]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleCancelConfirm = async () => {
    if (!cancelModal.targetId) return;

    setCancelModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await enrollmentService.cancelInvitation(cancelModal.targetId);
      toast.success(t('enrollment.invitations.cancelledSuccess'));
      setCancelModal({ isOpen: false, targetId: null, isLoading: false });
      await loadInvitations();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('stages.validation.loadError');
      toast.error(msg);
      setCancelModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={isArchived ? 4 : 5} className="p-8 text-center text-sm text-gray-500">
            {t('general.loading', { defaultValue: 'Завантаження...' })}
          </td>
        </tr>
      );
    }

    if (invitations.length === 0) {
      return (
        <tr>
          <td colSpan={isArchived ? 4 : 5} className="p-8 text-center text-sm text-gray-500">
            {t('enrollment.invitations.empty')}
          </td>
        </tr>
      );
    }

    return invitations.map((inv) => {
      const fullName = `${inv.user.firstName} ${inv.user.surname}`;

      return (
        <tr key={inv.invitationId} className="hover:bg-gray-50 transition-colors">
          <td className="p-3 font-medium text-gray-900">{fullName}</td>
          <td className="p-3 text-gray-600">{inv.user.email}</td>
          <td className="p-3 text-gray-500 whitespace-nowrap">
            {formatDate(inv.issuedAt, i18n.language)}
          </td>
          <td className="p-3">
            <EnrollmentStatusBadge status={inv.status} />
          </td>
          {!isArchived && (
            <td className="p-3 text-right whitespace-nowrap">
              <button
                type="button"
                onClick={() =>
                  setCancelModal({
                    isOpen: true,
                    targetId: inv.invitationId,
                    isLoading: false,
                  })
                }
                title={t('enrollment.invitations.cancel')}
                className="p-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-md transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header controls: Search and Send Invitation Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <AdminSearchInput
            search={search}
            setSearch={setSearch}
            setPage={setPage}
            placeholder={t('enrollment.invitations.searchPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {totalElements > 0 && (
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              {t('pagination.total', { count: totalElements, defaultValue: `Усього: ${totalElements}` })}
            </span>
          )}

          {!isArchived && (
            <button
              type="button"
              onClick={() => setIsSendModalOpen(true)}
              className="btn-regular inline-flex items-center gap-1.5 text-xs py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <UserPlus size={15} />
              <span>{t('enrollment.invitations.sendButton')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Invitations Table */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-3">{t('enrollment.invitations.columns.user')}</th>
              <th className="p-3">{t('enrollment.invitations.columns.email')}</th>
              <th className="p-3">{t('enrollment.invitations.columns.date')}</th>
              <th className="p-3">{t('enrollment.invitations.columns.status')}</th>
              {!isArchived && (
                <th className="p-3 text-right">{t('enrollment.invitations.columns.actions')}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Send Invitations Modal */}
      <SendInvitationsModal
        isOpen={isSendModalOpen}
        competitionId={competitionId}
        stageId={stageId}
        onClose={() => setIsSendModalOpen(false)}
        onInvitationsSent={loadInvitations}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        open={cancelModal.isOpen}
        title={t('enrollment.invitations.cancel')}
        message={t('enrollment.invitations.confirmCancel')}
        isLoading={cancelModal.isLoading}
        onClose={() => setCancelModal({ isOpen: false, targetId: null, isLoading: false })}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default StageInvitationsTab;
