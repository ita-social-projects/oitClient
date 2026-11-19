import type { InvitationHistoryItem, StageScope } from '@shared/models/invitation';
import { Calendar, CheckCircle2, Layers, XCircle, AlertCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../StudentCompetitions.module.scss';

export interface StudentInvitationCardProps {
  invitation: InvitationHistoryItem;
  onAccept?: (invitation: InvitationHistoryItem) => void;
  onReject?: (invitation: InvitationHistoryItem) => void;
  disabled?: boolean;
}

const SCOPE_STYLE_MAP: Record<StageScope, string> = {
  CITY: styles.scopeCity,
  DISTRICT: styles.scopeDistrict,
  REGIONAL: styles.scopeRegional,
  STATE: styles.scopeState,
  NATIONAL: styles.scopeNational,
  FOREIGN: styles.scopeForeign,
  OPEN: styles.scopeOpen,
};

const formatDate = (dateStr: string, locale = 'uk-UA'): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const StudentInvitationCard: React.FC<StudentInvitationCardProps> = ({
  invitation,
  onAccept,
  onReject,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation('profile');
  const { competition, stage, status, issuedAt, rejectionReason } = invitation;

  const scopeClass = SCOPE_STYLE_MAP[stage.scope] || styles.scopeCity;

  const renderStatusBadge = () => {
    switch (status) {
      case 'PENDING':
        return (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{t('studentInvitations.status.pending')}</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusAccepted || styles.statusParticipant}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('studentInvitations.status.accepted')}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{t('studentInvitations.status.rejected')}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span>{t('studentInvitations.status.cancelled')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    if (status !== 'PENDING') {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAccept?.(invitation)}
          className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('studentInvitations.actions.accept')}</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onReject?.(invitation)}
          className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 active:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs"
        >
          <XCircle className="w-4 h-4 text-red-500" />
          <span>{t('studentInvitations.actions.reject')}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex-1 space-y-3">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${styles.scopeBadge} ${scopeClass}`}>
            {t(`studentEnrollment.scope.${stage.scope}`, { defaultValue: stage.scope })}
          </span>
          {renderStatusBadge()}
        </div>

        {/* Competition Title */}
        <h3 className="text-lg font-bold text-gray-900 leading-snug">
          {competition.title}
        </h3>

        {/* Stage & Issued date info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-1.5 font-medium text-gray-800">
            <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{stage.title}</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {t('studentInvitations.issuedAt')}: {formatDate(issuedAt, i18n.language)}
            </span>
          </div>
        </div>

        {/* Rejection reason callout if present */}
        {status === 'REJECTED' && rejectionReason && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{t('studentInvitations.rejectionReasonLabel')}: </span>
              <span>{rejectionReason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action CTA Column */}
      <div className="flex md:flex-col items-center justify-end md:justify-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default StudentInvitationCard;
