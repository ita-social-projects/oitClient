import type { CompetitionStatus } from '@shared/models/competition';
import type {
  StageResponse,
  StageStatus,
  StageTourItem,
  StageTreeNode,
} from '@shared/models/stage';
import { stageService } from '@shared/services/stageService';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  MoreVertical,
  Pencil,
  Play,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import StageConfirmModal, {
  type StageConfirmActionType,
  type StageConfirmModalState,
} from './StageConfirmModal';import styles from './Stages.module.scss';
import StageScopeBadge from './StageScopeBadge';
import StageStatusBadge from './StageStatusBadge';
import StageToursSection from './StageToursSection';

interface StageCardProps {
  readonly node: StageTreeNode;
  readonly competitionStatus: CompetitionStatus;
  readonly isArchived: boolean;
  readonly previousStageFinished: boolean;
  readonly isExpanded: boolean;
  readonly onToggleExpand: () => void;
  readonly onEdit: (stage: StageResponse) => void;
  readonly onDelete: (stage: StageResponse) => void;
  readonly onStatusChanged: (stage: StageResponse) => void;
}

const NEXT_STAGE_STATUS: Record<Exclude<StageConfirmActionType, 'DELETE'>, StageStatus> = {
  START: 'IN_PROGRESS',
  FINISH: 'FINISHED',
  CANCEL: 'CANCELLED',
};

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

const areAllToursCompleted = (tours: StageTourItem[]): boolean =>
  tours.length > 0 &&
  tours.every(
    (t) => t.executionStatus === 'FINISHED' || t.executionStatus === 'CANCELLED'
  );

const getStartDisabledTitle = (
  canStart: boolean,
  competitionStatus: CompetitionStatus,
  t: (key: string) => string
): string => {
  if (canStart) return '';
  if (competitionStatus !== 'PUBLISHED') {
    return t('stages.validation.cannotStartNotPublished');
  }
  return t('stages.validation.cannotStartPreviousNotFinished');
};

const getFinishDisabledTitle = (
  canFinish: boolean,
  stageStatus: StageStatus,
  tours: StageTourItem[],
  t: (key: string) => string
): string => {
  if (canFinish || stageStatus !== 'IN_PROGRESS') return '';
  if (tours.length === 0) {
    return t('stages.validation.cannotFinishNoTours');
  }
  return t('stages.validation.cannotFinishToursNotCompleted');
};

export const StageCard: React.FC<StageCardProps> = ({
  node,
  competitionStatus,
  isArchived,
  previousStageFinished,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onStatusChanged,
}) => {
  const { t, i18n } = useTranslation('admin');
  const { stage, tours } = node;

  const [showMenu, setShowMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState<StageConfirmModalState>({
    open: false,
    type: 'START',
    isLoading: false,
  });

  // Preconditions checks
  const canStart =
    competitionStatus === 'PUBLISHED' &&
    previousStageFinished &&
    stage.status === 'SCHEDULED';
  const allToursCompleted = areAllToursCompleted(tours);
  const canFinish = stage.status === 'IN_PROGRESS' && allToursCompleted;
  const isCancellable =
    stage.status === 'SCHEDULED' || stage.status === 'IN_PROGRESS';

  const handleConfirmAction = async () => {
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      if (confirmModal.type === 'DELETE') {
        await stageService.deleteStage(stage.competitionId, stage.id);
        toast.success(t('stages.validation.deleteSuccess'));
        onDelete(stage);
      } else {
        const nextStatus = NEXT_STAGE_STATUS[confirmModal.type];
        const updated = await stageService.changeStageStatus(
          stage.competitionId,
          stage.id,
          {
            status: nextStatus,
            version: stage.version,
          }
        );
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

  const startDisabledTitle = getStartDisabledTitle(canStart, competitionStatus, t);
  const finishDisabledTitle = getFinishDisabledTitle(canFinish, stage.status, tours, t);

  const renderActionButton = () => {
    if (isArchived) return null;

    if (stage.status === 'SCHEDULED') {
      return (
        <span
          title={startDisabledTitle}
          className={`inline-block ${!canStart ? 'cursor-not-allowed' : ''}`}
        >
          <button
            type="button"
            disabled={!canStart}
            onClick={() => setConfirmModal({ open: true, type: 'START', isLoading: false })}
            className={`btn-regular inline-flex items-center gap-1.5 text-xs py-1.5 px-3 whitespace-nowrap ${
              !canStart ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
            }`}
            title={startDisabledTitle}
          >
            <Play size={13} className="shrink-0" />
            <span>{t('stages.actions.start')}</span>
          </button>
        </span>
      );
    }

    if (stage.status === 'IN_PROGRESS') {
      return (
        <span
          title={finishDisabledTitle}
          className={`inline-block ${!canFinish ? 'cursor-not-allowed' : ''}`}
        >
          <button
            type="button"
            disabled={!canFinish}
            onClick={() => setConfirmModal({ open: true, type: 'FINISH', isLoading: false })}
            className={`btn-regular inline-flex items-center gap-1.5 text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none whitespace-nowrap ${
              !canFinish ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
            }`}
            title={finishDisabledTitle}
          >
            <Clock size={13} className="shrink-0" />
            <span>{t('stages.actions.finish')}</span>
          </button>
        </span>
      );
    }

    return null;
  };

  return (
    <div className={styles.stageCard}>
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className={styles.stageNumberBadge}>
              {t('stages.stageNumber', { number: stage.sortPosition })}
            </span>
            <h4 className="font-semibold text-base text-gray-900 break-words">{stage.title}</h4>
            <div className="hidden sm:inline-flex items-center gap-2">
              <StageScopeBadge scope={stage.scope} />
              <StageStatusBadge status={stage.status} />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden sm:block">
              {renderActionButton()}
            </div>

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

                    {isCancellable && (
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
              onClick={onToggleExpand}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="toggle-accordion"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Badges & Action Row */}
        <div className="flex sm:hidden items-center justify-between gap-2 flex-wrap pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <StageScopeBadge scope={stage.scope} />
            <StageStatusBadge status={stage.status} />
          </div>
          <div>
            {renderActionButton()}
          </div>
        </div>
      </div>

      {/* Dates row */}
      <div className={styles.stageCardMeta}>
        <div className="flex items-start gap-1.5 text-xs text-gray-600 min-w-0">
          <Calendar size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            {formatDate(stage.dateStart, i18n.language)} — {formatDate(stage.dateFinish, i18n.language)}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 shrink-0 self-start sm:self-auto">
          {t('stages.toursCount', { count: tours.length })}
        </span>
      </div>

      {/* Accordion expanded content */}
      {isExpanded && (
        <div className={styles.stageAccordionBody}>
          {stage.description && (
            <div className="mb-4 text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 break-words">
              <span className="font-semibold block mb-1 text-gray-700">
                {t('stages.modal.descriptionLabel')}:
              </span>
              <p className="whitespace-pre-line break-words">{stage.description}</p>
            </div>
          )}

          {/* Tours List */}
          <StageToursSection
            stage={stage}
            competitionStatus={competitionStatus}
            isArchived={isArchived}
            onTourMutated={() => onStatusChanged(stage)}
          />
        </div>
      )}

      {/* Confirmation Modals */}
      <StageConfirmModal
        modalState={confirmModal}
        stageTitle={stage.title}
        onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default StageCard;
