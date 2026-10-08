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
import { toast } from 'react-toastify';


import styles from './Stages.module.scss';
import type { TourConfirmActionType } from './TourConfirmModal';
import TourExecutionStatusBadge from './TourExecutionStatusBadge';

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

const formatDuration = (
  startIso: string,
  finishIso: string,
  t: (key: string, options?: { count: number }) => string
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

  // Preconditions checks
  const canStart =
    competitionStatus === 'PUBLISHED' &&
    stageStatus === 'IN_PROGRESS' &&
    previousTourFinished &&
    tour.executionStatus === 'SCHEDULED';

  const canClose =
    stageStatus === 'IN_PROGRESS' && tour.executionStatus === 'IN_PROGRESS';

  const canResume =
    stageStatus === 'IN_PROGRESS' && tour.executionStatus === 'CLOSED';

  const canFinish =
    tour.executionStatus === 'IN_PROGRESS' || tour.executionStatus === 'CLOSED';

  const isCancellable =
    tour.executionStatus !== 'FINISHED' && tour.executionStatus !== 'CANCELLED';

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

  return (
    <div className={styles.tourCard}>
      <div className={styles.tourCardHeader}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={styles.stageNumberBadge}>
            {t('tours.tourNumber', { number: tour.sortPosition })}
          </span>
          <h5 className="font-semibold text-sm text-gray-900">{tour.title}</h5>
          <TourExecutionStatusBadge status={tour.executionStatus} />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick status action button */}
          {!isArchived && tour.executionStatus === 'SCHEDULED' && (
            <button
              type="button"
              disabled={!canStart}
              onClick={() => onStatusChange(tour, 'START')}
              className={`btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer ${
                !canStart ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={getStartDisabledTooltip()}
            >
              <Play size={12} />
              <span>{t('tours.actions.start')}</span>
            </button>
          )}

          {!isArchived && tour.executionStatus === 'IN_PROGRESS' && (
            <>
              <button
                type="button"
                disabled={!canClose}
                onClick={() => onStatusChange(tour, 'CLOSE')}
                className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
              >
                <Pause size={12} />
                <span>{t('tours.actions.close')}</span>
              </button>
              <button
                type="button"
                disabled={!canFinish}
                onClick={() => onStatusChange(tour, 'FINISH')}
                className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              >
                <Check size={12} />
                <span>{t('tours.actions.finish')}</span>
              </button>
            </>
          )}

          {!isArchived && tour.executionStatus === 'CLOSED' && (
            <>
              <button
                type="button"
                disabled={!canResume}
                onClick={() => onStatusChange(tour, 'RESUME')}
                className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
              >
                <Play size={12} />
                <span>{t('tours.actions.resume')}</span>
              </button>
              <button
                type="button"
                disabled={!canFinish}
                onClick={() => onStatusChange(tour, 'FINISH')}
                className="btn-regular inline-flex items-center gap-1 text-xs py-1 px-2.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              >
                <Check size={12} />
                <span>{t('tours.actions.finish')}</span>
              </button>
            </>
          )}

          {/* More actions dropdown */}
          {!isArchived && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="tour-actions"
              >
                <MoreVertical size={15} />
              </button>

              {showMenu && (
                <div
                  className={styles.actionsDropdown}
                  onMouseLeave={() => setShowMenu(false)}
                >
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
                      toast.info(t('tours.actions.manageTasks'));
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

      <div className={styles.tourCardMeta}>
        <div className="flex items-center gap-1">
          <Calendar size={13} className="text-gray-400" />
          <span>
            {formatDate(tour.dateStart, i18n.language)} —{' '}
            {formatDate(tour.dateFinish, i18n.language)} (
            {formatDuration(tour.dateStart, tour.dateFinish, t)})
          </span>
        </div>

        {tour.location && (
          <div className="flex items-center gap-1">
            <MapPin size={13} className="text-gray-400" />
            <span>{tour.location}</span>
          </div>
        )}
      </div>

      {tour.description && (
        <p className="mt-2 text-xs text-gray-500 whitespace-pre-line leading-relaxed">
          {tour.description}
        </p>
      )}
    </div>
  );
};

export default TourCard;
