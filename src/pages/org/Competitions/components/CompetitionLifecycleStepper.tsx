import { ConfirmModal } from '@shared/components/ConfirmModal';
import type { CompetitionResponse, CompetitionStatus } from '@shared/models/competition';
import { competitionService } from '@shared/services/competitionService.ts';
import { ArrowRight, Check, Info } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import styles from '../Competitions.module.scss';

interface CompetitionLifecycleStepperProps {
  readonly competitionId: number;
  readonly currentStatus: CompetitionStatus;
  readonly version: number;
  readonly onStatusChanged: (updated: CompetitionResponse) => void;
}

const STEPS: CompetitionStatus[] = [
  'DRAFT',
  'ENROLLMENT',
  'PUBLISHED',
  'FINISHED',
  'ARCHIVED',
];

const NEXT_STATUS_MAP: Partial<Record<CompetitionStatus, CompetitionStatus>> = {
  DRAFT: 'ENROLLMENT',
  ENROLLMENT: 'PUBLISHED',
  PUBLISHED: 'FINISHED',
  FINISHED: 'ARCHIVED',
};

export const CompetitionLifecycleStepper: React.FC<CompetitionLifecycleStepperProps> = ({
  competitionId,
  currentStatus,
  version,
  onStatusChanged,
}) => {
  const { t } = useTranslation('admin');
  const [modalOpen, setModalOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentIndex = STEPS.indexOf(currentStatus);
  const nextStatus = NEXT_STATUS_MAP[currentStatus];

  const handleConfirmChange = async () => {
    if (!nextStatus) return;

    setIsChanging(true);
    try {
      const updated = await competitionService.changeStatus(competitionId, {
        status: nextStatus,
        version,
      });

      toast.success(t('competitionLifecycle.statusChangedSuccess'));
      onStatusChanged(updated);
      setModalOpen(false);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(t('competitionLifecycle.conflictError'));
      } else {
        const backendMessage = err?.response?.data?.message;
        toast.error(backendMessage || t('competitionLifecycle.statusChangeError'));
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={styles.stepperCard}>
      <div className={styles.stepperHeader}>
        <div>
          <h3 className="font-semibold text-base text-gray-900">
            {t('competitionLifecycle.title')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('competitionLifecycle.currentStatus')}:{' '}
            <span className="font-semibold text-gray-800">
              {t(`competitionStatus.${currentStatus}`)}
            </span>
          </p>
        </div>

        {nextStatus && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-regular inline-flex items-center gap-2 text-sm cursor-pointer"
          >
            <span>
              {t(`competitionLifecycle.nextAction${currentStatus}`)}
            </span>
            <ArrowRight size={15} />
          </button>
        )}

        {currentStatus === 'ARCHIVED' && (
          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
            {t('competitionLifecycle.archivedNote')}
          </span>
        )}
      </div>

      <div className={styles.stepperTrack}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step}>
              <div className={styles.stepperItem}>
                <div
                  className={`${styles.stepperNode} ${isCompleted
                      ? styles.stepperNodeCompleted
                      : isCurrent
                        ? styles.stepperNodeCurrent
                        : styles.stepperNodeUpcoming
                    }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={2.5} /> : idx + 1}
                </div>
                <span
                  className={`${styles.stepperText} ${isCurrent ? styles.current : ''}`}
                >
                  {t(`competitionStatus.${step}`)}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`${styles.stepperDivider} ${idx < currentIndex ? styles.completed : ''
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {currentStatus === 'DRAFT' && (
        <div className={styles.noticeBox}>
          <Info size={18} className="shrink-0 mt-0.5 text-blue-600" />
          <span>
            {t('competitionLifecycle.draftRuleNotice')}
          </span>
        </div>
      )}

      {nextStatus && (
        <ConfirmModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={t('competitionLifecycle.confirmTitle')}
          message={t('competitionLifecycle.confirmMessage', {
            from: t(`competitionStatus.${currentStatus}`),
            to: t(`competitionStatus.${nextStatus}`),
          })}
          confirmText={
            isChanging
              ? t('competitionLifecycle.changingStatus')
              : t('competitionLifecycle.confirmYes')
          }
          cancelText={t('competitionLifecycle.confirmNo')}
          isLoading={isChanging}
          onConfirm={handleConfirmChange}
        />
      )}
    </div>
  );
};

export default CompetitionLifecycleStepper;
