import { ConfirmModal } from '@components/ConfirmModal';
import Pagination from '@components/Pagination';
import { emitInvitationsChanged } from '@shared/hooks/usePendingInvitationsCount';
import type { InvitationHistoryItem } from '@shared/models/invitation';
import { invitationService } from '@shared/services/invitationService';
import useAuth from '@shared/state/authState';
import { AlertCircle, Inbox, Loader2, Mail } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { StudentInvitationCard } from './components/StudentInvitationCard';
import { StudentInvitationRejectModal } from './components/StudentInvitationRejectModal';

export type SubTabType = 'new' | 'history';

const PAGE_SIZE = 10;

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: unknown;
  };
}

export const StudentInvitationsTab: React.FC = () => {
  const { t } = useTranslation(['profile', 'common']);
  const user = useAuth((state) => state.user);

  const [subTab, setSubTab] = useState<SubTabType>('new');
  const [invitations, setInvitations] = useState<InvitationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [acceptTarget, setAcceptTarget] = useState<InvitationHistoryItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<InvitationHistoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latestRequestRef = useRef(0);

  const fetchInvitations = useCallback(async () => {
    if (!user?.id) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    try {
      const params = {
        status: subTab === 'new' ? ('PENDING' as const) : undefined,
        page,
        size: PAGE_SIZE,
        sort: 'issuedAt,desc',
      };

      const response = await invitationService.getUserInvitations(user.id, params);

      if (requestId !== latestRequestRef.current) return;

      setInvitations(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch {
      if (requestId !== latestRequestRef.current) return;
      setError(t('studentInvitations.toast.errorDefault'));
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, subTab, page, t]);

  useEffect(() => {
    fetchInvitations();
    return () => {
      latestRequestRef.current += 1;
    };
  }, [fetchInvitations]);

  const handleSubTabChange = (newSubTab: SubTabType) => {
    if (newSubTab === subTab) return;
    setSubTab(newSubTab);
    setPage(0);
  };

  const handleConfirmAccept = async () => {
    if (!acceptTarget) return;
    setIsSubmitting(true);
    try {
      await invitationService.acceptInvitation(acceptTarget.invitationId);
      toast.success(t('studentInvitations.toast.acceptSuccess'));
      emitInvitationsChanged();
      setAcceptTarget(null);
      await fetchInvitations();
    } catch (err) {
      const axiosErr = err as AxiosLikeError;
      if (axiosErr.response?.status === 400) {
        toast.error(t('studentInvitations.toast.alreadyProcessed'));
      } else {
        toast.error(t('studentInvitations.toast.errorDefault'));
      }
      setAcceptTarget(null);
      await fetchInvitations();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!rejectTarget) return;
    setIsSubmitting(true);
    try {
      await invitationService.rejectInvitation(rejectTarget.invitationId, {
        rejectionReason: reason || null,
      });
      toast.success(t('studentInvitations.toast.rejectSuccess'));
      emitInvitationsChanged();
      setRejectTarget(null);
      await fetchInvitations();
    } catch (err) {
      const axiosErr = err as AxiosLikeError;
      if (axiosErr.response?.status === 400) {
        toast.error(t('studentInvitations.toast.alreadyProcessed'));
      } else {
        toast.error(t('studentInvitations.toast.errorDefault'));
      }
      setRejectTarget(null);
      await fetchInvitations();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">{t('general.loading', { defaultValue: 'Завантаження...' })}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={fetchInvitations}
            className="ml-auto text-xs underline font-medium hover:text-red-900 cursor-pointer"
          >
            {t('general.retry', { defaultValue: 'Спробувати ще раз' })}
          </button>
        </div>
      );
    }

    if (invitations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full mb-3">
            {subTab === 'new' ? <Mail className="w-8 h-8" /> : <Inbox className="w-8 h-8" />}
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {subTab === 'new'
              ? t('studentInvitations.empty.noNewInvitations')
              : t('studentInvitations.empty.noHistory')}
          </h3>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {invitations.map((invitation) => (
            <StudentInvitationCard
              key={invitation.invitationId}
              invitation={invitation}
              onAccept={(target) => setAcceptTarget(target)}
              onReject={(target) => setRejectTarget(target)}
              disabled={isSubmitting}
            />
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Sub-tabs buttons */}
        <div className="inline-flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/80">
          <button
            type="button"
            onClick={() => handleSubTabChange('new')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition cursor-pointer ${
              subTab === 'new'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('studentInvitations.subTabs.new')}
          </button>
          <button
            type="button"
            onClick={() => handleSubTabChange('history')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition cursor-pointer ${
              subTab === 'history'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('studentInvitations.subTabs.history')}
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Accept Confirm Modal */}
      {acceptTarget && (
        <ConfirmModal
          open={Boolean(acceptTarget)}
          isLoading={isSubmitting}
          title={t('studentInvitations.modal.acceptTitle')}
          message={t('studentInvitations.modal.acceptMessage', {
            title: acceptTarget.competition.title,
            stageTitle: acceptTarget.stage.title,
          })}
          confirmText={t('studentInvitations.modal.acceptConfirm')}
          cancelText={t('studentInvitations.modal.cancel')}
          onConfirm={handleConfirmAccept}
          onClose={() => !isSubmitting && setAcceptTarget(null)}
        />
      )}

      {/* Reject Modal */}
      <StudentInvitationRejectModal
        isOpen={Boolean(rejectTarget)}
        invitation={rejectTarget}
        isLoading={isSubmitting}
        onClose={() => !isSubmitting && setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};

export default StudentInvitationsTab;
