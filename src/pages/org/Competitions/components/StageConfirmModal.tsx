import { ConfirmModal } from '@shared/components/ConfirmModal';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type StageConfirmActionType = 'START' | 'FINISH' | 'CANCEL' | 'DELETE';

export interface StageConfirmModalState {
  open: boolean;
  type: StageConfirmActionType;
  isLoading: boolean;
}

export interface StageConfirmModalProps {
  readonly modalState: StageConfirmModalState;
  readonly stageTitle: string;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export const StageConfirmModal: React.FC<StageConfirmModalProps> = ({
  modalState,
  stageTitle,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('admin');
  const { open, type, isLoading } = modalState;

  if (!open) return null;

  const titles: Record<StageConfirmActionType, string> = {
    START: t('stages.actions.confirmStartTitle'),
    FINISH: t('stages.actions.confirmFinishTitle'),
    CANCEL: t('stages.actions.confirmCancelTitle'),
    DELETE: t('stages.actions.confirmDeleteTitle'),
  };

  const messages: Record<StageConfirmActionType, string> = {
    START: t('stages.actions.confirmStartMessage', { title: stageTitle }),
    FINISH: t('stages.actions.confirmFinishMessage', { title: stageTitle }),
    CANCEL: t('stages.actions.confirmCancelMessage', { title: stageTitle }),
    DELETE: t('stages.actions.confirmDeleteMessage', { title: stageTitle }),
  };

  const confirmText = isLoading
    ? type === 'DELETE'
      ? t('stages.actions.deleting')
      : t('stages.actions.statusChanging')
    : t('competitionLifecycle.confirmYes');

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title={titles[type]}
      message={messages[type]}
      confirmText={confirmText}
      cancelText={t('competitionLifecycle.confirmNo')}
      isLoading={isLoading}
      onConfirm={onConfirm}
    />
  );
};

export default StageConfirmModal;
