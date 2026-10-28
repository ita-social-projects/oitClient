import type { CompetitionStatus } from '@shared/models/competition';
import type { StageStatus } from '@shared/models/stage';
import type { TourResponse } from '@shared/models/tour';
import {
  Calendar,
  Check,
  FileText,
  MapPin,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Stages.module.scss';
import type { TourConfirmActionType } from './TourConfirmModal';
import TourExecutionStatusBadge from './TourExecutionStatusBadge';
import TourTasksModal from './TourTasksModal';

interface TourCardProps {
  readonly tour: TourResponse;
  readonly stageStatus: StageStatus;
  readonly competitionStatus: CompetitionStatus;
  readonly isArchived: boolean;
  readonly previousTourFinished: boolean;
  readonly onEdit: (tour: TourResponse) => void;
  readonly onDelete: (tour: TourResponse) => void;
  readonly onStatusChange: (tour: TourResponse, action: TourConfirmActionType) => void;
}

const formatDate = (isoStr: string, locale = 'uk'): string => {
  try {
    const d = new Date(isoStr);
    const resolvedLocale = locale.startsWith('en') ? 'en-US' : 'uk-UA';
    return d.toLocaleDateString(resolvedLocale, {
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

const formatDuration = (
  startIso: string,
  finishIso: string,
  t: (key: string, options?: { count: number }) => string,
): string => {
  try {
    const start = new Date(startIso).getTime();
    const finish = new Date(finishIso).getTime();
    const diffHours = Math.round((finish - start) / (1000 * 60 * 60));
    return t('tours.durationHours', { count: diffHours });
  } catch {
    return '';
  }
};

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  stageStatus,
  competitionStatus,
  isArchived,
  previousTourFinished,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { t, i18n } = useTranslation('admin');
  const [showMenu, setShowMenu] = useState(false);
  const [openTasksModal, setOpenTasksModal] = useState(false);

  // Preconditions checks
  const canStart =
    competitionStatus === 'PUBLISHED' &&
    stageStatus === 'IN_PROGRESS' &&
    previousTourFinished &&
    tour.executionStatus === 'SCHEDULED';

  const canClose = stageStatus === 'IN_PROGRESS' && tour.executionStatus === 'IN_PROGRESS';

  const canResume = stageStatus === 'IN_PROGRESS' && tour.executionStatus === 'CLOSED';

  const canFinish = tour.executionStatus === 'IN_PROGRESS' || tour.executionStatus === 'CLOSED';

  const isCancellable = tour.executionStatus !== 'FINISHED' && tour.executionStatus !== 'CANCELLED';

  const getStartDisabledTooltip = (): string => {
    if (canStart) return '';
    if (competitionStatus !== 'PUBLISHED') {
      return t('tours.preconditions.competitionNotPublished');
    }
    if (stageStatus !== 'IN_PROGRESS') {
      return t('tours.preconditions.stageNotInProgress');
    }
    if (!previousTourFinished) {
      return t('tours.preconditions.previousTourNotFinished');
    }
    return '';
  };

  const renderTourActions = () => {
    if (isArchived) return null;

    if (tour.executionStatus === 'SCHEDULED') {
      return (
        <span
          title={getStartDisabledTooltip()}
          className={`inline-block ${!canStart ? 'cursor-not-allowed' : ''}`}
        >
          <button
            type="button"
            disabled={!canStart}
            onClick={() => onStatusChange(tour, 'START')}
            className={`btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 whitespace-nowrap ${
              !canStart ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
            }`}
            title={getStartDisabledTooltip()}
          >
            <Play size={12} className="shrink-0" />
            <span>{t('tours.actions.start')}</span>
          </button>
        </span>
      );
    }

    if (tour.executionStatus === 'IN_PROGRESS') {
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={!canClose}
            onClick={() => onStatusChange(tour, 'CLOSE')}
            className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 whitespace-nowrap"
          >
            <Pause size={12} className="shrink-0" />
            <span>{t('tours.actions.close')}</span>
          </button>
          <button
            type="button"
            disabled={!canFinish}
            onClick={() => onStatusChange(tour, 'FINISH')}
            className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none whitespace-nowrap"
          >
            <Check size={12} className="shrink-0" />
            <span>{t('tours.actions.finish')}</span>
          </button>
        </div>
      );
    }

    if (tour.executionStatus === 'CLOSED') {
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={!canResume}
            onClick={() => onStatusChange(tour, 'RESUME')}
            className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 whitespace-nowrap"
          >
            <Play size={12} className="shrink-0" />
            <span>{t('tours.actions.resume')}</span>
          </button>
          <button
            type="button"
            disabled={!canFinish}
            onClick={() => onStatusChange(tour, 'FINISH')}
            className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none whitespace-nowrap"
          >
            <Check size={12} className="shrink-0" />
            <span>{t('tours.actions.finish')}</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.tourCard}>
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className={styles.stageNumberBadge}>
              {t('tours.tourNumber', { number: tour.sortPosition })}
            </span>
            <h5 className="font-semibold text-sm text-gray-900 break-words">{tour.title}</h5>
            <div className="hidden sm:inline-flex">
              <TourExecutionStatusBadge status={tour.executionStatus} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">{renderTourActions()}</div>

            {/* More actions dropdown */}
            {!isArchived && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label={t('tours.actions.menuLabel')}
                >
                  <MoreVertical size={15} />
                </button>

                {showMenu && (
                  <div className={styles.actionsDropdown} onMouseLeave={() => setShowMenu(false)}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(tour);
                      }}
                      className={styles.dropdownItem}
                    >
                      <Pencil size={13} />
                      <span>{t('tours.actions.edit')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setOpenTasksModal(true);
                      }}
                      className={styles.dropdownItem}
                    >
                      <FileText size={13} />
                      <span>{t('tours.actions.manageTasks')}</span>
                    </button>

                    {isCancellable && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onStatusChange(tour, 'CANCEL');
                        }}
                        className={`${styles.dropdownItem} text-amber-600`}
                      >
                        <XCircle size={13} />
                        <span>{t('tours.actions.cancel')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(tour);
                      }}
                      className={`${styles.dropdownItem} text-red-600`}
                    >
                      <Trash2 size={13} />
                      <span>{t('tours.actions.delete')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile status & actions */}
        <div className="flex sm:hidden items-center justify-between gap-2 flex-wrap pt-0.5">
          <TourExecutionStatusBadge status={tour.executionStatus} />
          <div>{renderTourActions()}</div>
        </div>
      </div>

      <div className={styles.tourCardMeta}>
        <div className="flex items-start gap-1 text-xs text-gray-600 min-w-0">
          <Calendar size={13} className="text-gray-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            {formatDate(tour.dateStart, i18n.language)} —{' '}
            {formatDate(tour.dateFinish, i18n.language)} (
            {formatDuration(tour.dateStart, tour.dateFinish, t)})
          </span>
        </div>

        {tour.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded-md border border-gray-200/60 self-start sm:self-auto">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <span className="break-words">{tour.location}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpenTasksModal(true)}
          aria-label={t('tours.actions.manageTasks')}
          className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200/80 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FileText size={12} className="text-emerald-600 shrink-0" />
          <span>{t('tours.actions.manageTasks')}</span>
        </button>
      </div>

      {tour.description && (
        <div className="mt-2.5 text-xs text-gray-600 leading-relaxed bg-white/80 p-2.5 rounded-md border border-gray-200/60 break-words">
          <span className="font-semibold block mb-0.5 text-gray-700 text-[11px] uppercase tracking-wider">
            {t('tours.modal.descriptionLabel')}:
          </span>
          <p className="whitespace-pre-line break-words">{tour.description}</p>
        </div>
      )}

      <TourTasksModal
        isOpen={openTasksModal}
        tour={tour}
        onClose={() => setOpenTasksModal(false)}
      />
    </div>
  );
};

export default TourCard;
