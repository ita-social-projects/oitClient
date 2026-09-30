import { ConfirmModal } from '@shared/components/ConfirmModal';
import type { CompetitionStatus } from '@shared/models/competition';
import type { StageResponse, StageTreeNode } from '@shared/models/stage';
import { stageService } from '@shared/services/stageService';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import styles from './Stages.module.scss';
import StageScopeBadge from './StageScopeBadge';
import StageStatusBadge from './StageStatusBadge';

interface StageCardProps {
  readonly node: StageTreeNode;
  readonly competitionStatus: CompetitionStatus;
  readonly isArchived: boolean;
  readonly previousStageFinished: boolean;
  readonly onEdit: (stage: StageResponse) => void;
  readonly onDelete: (stage: StageResponse) => void;
  readonly onStatusChanged: (stage: StageResponse) => void;
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

export const StageCard: React.FC<StageCardProps> = ({
  node,
  competitionStatus,
  isArchived,
  previousStageFinished,
  onEdit,
  onDelete,
  onStatusChanged,
}) => {
  const { t, i18n } = useTranslation('admin');
  const { stage, tours } = node;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'START' | 'FINISH' | 'CANCEL' | 'DELETE';
    isLoading: boolean;
  }>({ open: false, type: 'START', isLoading: false });

  // Preconditions checks
  const canStart =
    competitionStatus === 'PUBLISHED' && previousStageFinished && stage.status === 'SCHEDULED';
  const allToursCompleted =
    tours.length > 0 && tours.every((t) => t.executionStatus === 'FINISHED' || t.executionStatus === 'CANCELLED');
  const canFinish = stage.status === 'IN_PROGRESS' && allToursCompleted;

  const handleConfirmAction = async () => {
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      if (confirmModal.type === 'DELETE') {
        await stageService.deleteStage(stage.competitionId, stage.id);
        toast.success(t('stages.validation.deleteSuccess'));
        onDelete(stage);
      } else {
        const nextStatus =
          confirmModal.type === 'START'
            ? 'IN_PROGRESS'
            : confirmModal.type === 'FINISH'
            ? 'FINISHED'
            : 'CANCELLED';

        const updated = await stageService.changeStageStatus(stage.competitionId, stage.id, {
          status: nextStatus,
          version: stage.version,
        });
        toast.success(t('stages.validation.statusChangeSuccess'));
        onStatusChanged(updated);
      }
      setConfirmModal({ open: false, type: 'START', isLoading: false });
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(t('stages.validation.conflictError'));
        onStatusChanged(stage);
      } else {
        const backendMessage = err?.response?.data?.message;
        toast.error(backendMessage || t('stages.validation.loadError'));
      }
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className={styles.stageCard}>
      {/* Top Header */}
      <div className={styles.stageCardHeader}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={styles.stageNumberBadge}>
            {t('stages.stageNumber', { number: stage.sortPosition })}
          </span>
          <h4 className="font-semibold text-base text-gray-900">{stage.title}</h4>
          <StageScopeBadge scope={stage.scope} />
          <StageStatusBadge status={stage.status} />
        </div>

        <div className="flex items-center gap-2">
          {/* Quick status action button */}
          {!isArchived && stage.status === 'SCHEDULED' && (
            <button
              type="button"
              disabled={!canStart}
              onClick={() => setConfirmModal({ open: true, type: 'START', isLoading: false })}
              className={`btn-regular inline-flex items-center gap-1.5 text-xs py-1.5 px-3 cursor-pointer ${
                !canStart ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={
                !canStart
                  ? competitionStatus !== 'PUBLISHED'
                    ? t('stages.validation.cannotStartNotPublished')
                    : t('stages.validation.cannotStartPreviousNotFinished')
                  : ''
              }
            >
              <Play size={13} />
              <span>{t('stages.actions.start')}</span>
            </button>
          )}

          {!isArchived && stage.status === 'IN_PROGRESS' && (
            <button
              type="button"
              disabled={!canFinish}
              onClick={() => setConfirmModal({ open: true, type: 'FINISH', isLoading: false })}
              className={`btn-regular inline-flex items-center gap-1.5 text-xs py-1.5 px-3 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none ${
                !canFinish ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={!canFinish ? t('stages.validation.cannotFinishToursNotCompleted') : ''}
            >
              <Clock size={13} />
              <span>{t('stages.actions.finish')}</span>
            </button>
          )}

          {/* More actions dropdown */}
          {!isArchived && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="stage-actions"
              >
                <MoreVertical size={16} />
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
                      onEdit(stage);
                    }}
                    className={styles.dropdownItem}
                  >
                    <Pencil size={14} />
                    <span>{t('stages.actions.edit')}</span>
                  </button>

                  {(stage.status === 'SCHEDULED' || stage.status === 'IN_PROGRESS') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setConfirmModal({ open: true, type: 'CANCEL', isLoading: false });
                      }}
                      className={`${styles.dropdownItem} text-amber-600`}
                    >
                      <XCircle size={14} />
                      <span>{t('stages.actions.cancel')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setConfirmModal({ open: true, type: 'DELETE', isLoading: false });
                    }}
                    className={`${styles.dropdownItem} text-red-600`}
                  >
                    <Trash2 size={14} />
                    <span>{t('stages.actions.delete')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Accordion toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="toggle-accordion"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Dates row */}
      <div className={styles.stageCardMeta}>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar size={14} className="text-gray-400" />
          <span>
            {formatDate(stage.dateStart, i18n.language)} — {formatDate(stage.dateFinish, i18n.language)}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {t('stages.toursCount', { count: tours.length })}
        </span>
      </div>

      {/* Accordion expanded content */}
      {isExpanded && (
        <div className={styles.stageAccordionBody}>
          {stage.description && (
            <div className="mb-4 text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="font-semibold block mb-1 text-gray-700">
                {t('stages.modal.descriptionLabel')}:
              </span>
              <p className="whitespace-pre-line">{stage.description}</p>
            </div>
          )}

          {/* Tours List */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t('stages.tours.title')}
              </span>
              {!isArchived && (
                <button
                  type="button"
                  onClick={() => toast.info(t('stages.actions.addTourPlaceholder'))}
                  className="text-xs text-primary-100 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Plus size={13} />
                  <span>{t('stages.actions.addTour')}</span>
                </button>
              )}
            </div>

            {tours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tours.map((tour) => (
                  <div key={tour.id} className={styles.tourMiniCard}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {tour.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                        {tour.executionStatus}
                      </span>
                    </div>
                    {tour.location && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{tour.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-xs text-gray-400">{t('stages.tours.noTours')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {confirmModal.open && (
        <ConfirmModal
          open={confirmModal.open}
          onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
          title={
            confirmModal.type === 'START'
              ? t('stages.actions.confirmStartTitle')
              : confirmModal.type === 'FINISH'
              ? t('stages.actions.confirmFinishTitle')
              : confirmModal.type === 'CANCEL'
              ? t('stages.actions.confirmCancelTitle')
              : t('stages.actions.confirmDeleteTitle')
          }
          message={
            confirmModal.type === 'START'
              ? t('stages.actions.confirmStartMessage', { title: stage.title })
              : confirmModal.type === 'FINISH'
              ? t('stages.actions.confirmFinishMessage', { title: stage.title })
              : confirmModal.type === 'CANCEL'
              ? t('stages.actions.confirmCancelMessage', { title: stage.title })
              : t('stages.actions.confirmDeleteMessage', { title: stage.title })
          }
          confirmText={
            confirmModal.isLoading
              ? confirmModal.type === 'DELETE'
                ? t('stages.actions.deleting')
                : t('stages.actions.statusChanging')
              : t('competitionLifecycle.confirmYes')
          }
          cancelText={t('competitionLifecycle.confirmNo')}
          isLoading={confirmModal.isLoading}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
};

export default StageCard;
