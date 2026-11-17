import type { OpenCompetitionEnrollmentResponse, StageScope } from '@shared/models/enrollment';
import { sanitizeHtmlNoImages } from '@utils/sanitize';
import { normalizeSpaces } from '@utils/textUtils';
import { Calendar, CheckCircle2, Layers, RotateCcw, Send, XCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../StudentCompetitions.module.scss';

export interface StudentCompetitionCardProps {
  competition: OpenCompetitionEnrollmentResponse;
  onApply: (competition: OpenCompetitionEnrollmentResponse) => void;
  onCancel: (competition: OpenCompetitionEnrollmentResponse) => void;
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
    });
  } catch {
    return dateStr;
  }
};

export const StudentCompetitionCard: React.FC<StudentCompetitionCardProps> = ({
  competition,
  onApply,
  onCancel,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation('profile');

  const {
    competition: compInfo,
    stage: stageInfo,
    userApplication,
    isParticipant,
  } = competition;

  const appStatus = userApplication?.status;
  const scopeClass = SCOPE_STYLE_MAP[stageInfo.scope] || styles.scopeCity;

  const renderStatusBadge = () => {
    if (isParticipant) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusParticipant}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t('studentEnrollment.status.participant')}</span>
        </span>
      );
    }

    if (appStatus === 'PENDING') {
      return (
        <span className={`${styles.statusBadge} ${styles.statusPending}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{t('studentEnrollment.status.pending')}</span>
        </span>
      );
    }

    if (appStatus === 'REJECTED') {
      return (
        <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>{t('studentEnrollment.status.rejected')}</span>
        </span>
      );
    }

    if (appStatus === 'CANCELLED') {
      return (
        <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span>{t('studentEnrollment.status.cancelled')}</span>
        </span>
      );
    }

    return null;
  };

  const renderActionButton = () => {
    if (isParticipant) {
      return null;
    }

    if (appStatus === 'PENDING') {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCancel(competition)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 active:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs"
        >
          <XCircle className="w-4 h-4 text-red-500" />
          <span>{t('studentEnrollment.actions.cancel')}</span>
        </button>
      );
    }

    if (appStatus === 'REJECTED') {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(competition)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('studentEnrollment.actions.reapply')}</span>
        </button>
      );
    }

    // No application or CANCELLED
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onApply(competition)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs"
      >
        <Send className="w-4 h-4" />
        <span>{t('studentEnrollment.actions.apply')}</span>
      </button>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex-1 space-y-3">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${styles.scopeBadge} ${scopeClass}`}>
            {t(`studentEnrollment.scope.${stageInfo.scope}`, { defaultValue: stageInfo.scope })}
          </span>
          {renderStatusBadge()}
        </div>

        {/* Competition Title */}
        <h3 className="text-lg font-bold text-gray-900 leading-snug">
          {compInfo.title}
        </h3>

        {/* Stage & Dates info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-1.5 font-medium text-gray-800">
            <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{stageInfo.title}</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {t('studentEnrollment.stageDates')}:{' '}
              {formatDate(stageInfo.dateStart, i18n.language)} –{' '}
              {formatDate(stageInfo.dateFinish, i18n.language)}
            </span>
          </div>
        </div>

        {/* Competition overall dates */}
        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            {t('studentEnrollment.dates')}:{' '}
            {formatDate(compInfo.dateStart, i18n.language)} –{' '}
            {formatDate(compInfo.dateFinish, i18n.language)}
          </span>
        </div>

        {/* Description */}
        {compInfo.description && (
          <div
            className="text-sm text-gray-600 line-clamp-2 pt-1 border-t border-gray-100"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtmlNoImages(normalizeSpaces(compInfo.description)),
            }}
          />
        )}
      </div>

      {/* Action / CTA Column */}
      <div className="flex md:flex-col items-center justify-end md:justify-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
        {renderActionButton()}
      </div>
    </div>
  );
};

export default StudentCompetitionCard;

