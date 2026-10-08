/* eslint-disable react-hooks/purity */
import { ConfirmModal } from '@shared/components/ConfirmModal';
import type { TourResponse } from '@shared/models/tour';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Stages.module.scss';

export type TourConfirmActionType =
  | 'START'
  | 'CLOSE'
  | 'RESUME'
  | 'FINISH'
  | 'CANCEL'
  | 'DELETE';

export interface TourConfirmModalState {
  open: boolean;
  type: TourConfirmActionType;
  isLoading: boolean;
}

export interface TourConfirmModalProps {
  readonly modalState: TourConfirmModalState;
  readonly tour: TourResponse | null;
  readonly onClose: () => void;
  readonly onConfirm: (extendedFinishDate?: string) => void;
}

export const TourConfirmModal: React.FC<TourConfirmModalProps> = ({
  modalState,
  tour,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('admin');
  const { open, type, isLoading } = modalState;

  const [extendedFinish, setExtendedFinish] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  if (!open || !tour) return null;

  const isResumeExpired =
    type === 'RESUME' && new Date(tour.dateFinish).getTime() <= Date.now();

  const titles: Record<TourConfirmActionType, string> = {
    START: t('tours.confirm.startTitle'),
    CLOSE: t('tours.confirm.closeTitle'),
    RESUME: t('tours.confirm.resumeTitle'),
    FINISH: t('tours.confirm.finishTitle'),
    CANCEL: t('tours.confirm.cancelTitle'),
    DELETE: t('tours.confirm.deleteTitle'),
  };

  const messages: Record<TourConfirmActionType, string> = {
    START: t('tours.confirm.startMessage', { title: tour.title }),
    CLOSE: t('tours.confirm.closeMessage', { title: tour.title }),
    RESUME: t('tours.confirm.resumeMessage', { title: tour.title }),
    FINISH: t('tours.confirm.finishMessage', { title: tour.title }),
    CANCEL: t('tours.confirm.cancelMessage', { title: tour.title }),
    DELETE: t('tours.confirm.deleteMessage', { title: tour.title }),
  };

  const getConfirmText = (): string => {
    if (!isLoading) {
      return t('competitionLifecycle.confirmYes');
    }
    if (type === 'DELETE') {
      return t('tours.confirm.deleting');
    }
    return t('tours.confirm.statusChanging');
  };

  const handleConfirm = () => {
    if (isResumeExpired) {
      if (!extendedFinish) {
        setDateError(t('tours.confirm.extraTimeRequired'));
        return;
      }
      const finishDate = new Date(extendedFinish);
      if (finishDate.getTime() <= Date.now()) {
        setDateError(t('tours.preconditions.finishDateInPast'));
        return;
      }
      onConfirm(finishDate.toISOString());
    } else {
      onConfirm();
    }
  };

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title={titles[type]}
      message={
        <div>
          <p className="mb-3">{messages[type]}</p>
          {isResumeExpired && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
              <label
                htmlFor="tour-extra-finish"
                className="block text-xs font-semibold text-amber-900 mb-1"
              >
                {t('tours.confirm.extraTimeLabel')} *
              </label>
              <input
                id="tour-extra-finish"
                type="datetime-local"
                value={extendedFinish}
                onChange={(e) => {
                  setExtendedFinish(e.target.value);
                  if (dateError) setDateError(null);
                }}
                className={`${styles.input} text-xs`}
              />
              {dateError && <span className={styles.fieldError}>{dateError}</span>}
            </div>
          )}
        </div>
      }
      confirmText={getConfirmText()}
      cancelText={t('competitionLifecycle.confirmNo')}
      isLoading={isLoading}
      onConfirm={handleConfirm}
    />
  );
};

export default TourConfirmModal;
