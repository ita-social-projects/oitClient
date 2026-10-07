import { Modal, ModalDialog } from '@mui/joy';
import { X } from 'lucide-react';
import React, { useState } from 'react';

import { ModalFormActions } from './ModalFormActions';
import styles from './Stages.module.scss';

export interface BaseModalDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly onSubmit: () => Promise<void>;
  readonly validate: () => boolean;
  readonly cancelText: string;
  readonly submitText: string;
  readonly savingText: string;
  readonly children: React.ReactNode;
}

export const BaseModalDialog: React.FC<BaseModalDialogProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  validate,
  cancelText,
  submitText,
  savingText,
  children,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !isSubmitting && onClose()}>
      <ModalDialog
        className={styles.modalCard}
        sx={{ p: 0, border: 'none' }}
      >
        <div className={styles.modalHeader}>
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className={styles.modalBody}>
          {children}

          <ModalFormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
            cancelText={cancelText}
            submitText={submitText}
            savingText={savingText}
          />
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default BaseModalDialog;
