import { Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, DialogActions } from '@mui/joy';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmText,
  cancelText,
  isLoading = false,
}) => {
  const { t } = useTranslation('admin');

  return (
    <Modal open={open} onClose={() => !isLoading && onClose()}>
      <ModalDialog>
        <ModalClose disabled={isLoading} />
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <button
            type="button"
            className="btn-regular"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {confirmText || t('news-create.confirmYes')}
          </button>
          <button
            type="button"
            className="btn"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelText || t('news-create.confirmNo')}
          </button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};
