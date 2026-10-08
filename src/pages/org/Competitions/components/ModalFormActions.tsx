import { Loader2 } from 'lucide-react';
import React from 'react';

import styles from './Stages.module.scss';

export interface ModalFormActionsProps {
  readonly onClose: () => void;
  readonly isSubmitting: boolean;
  readonly cancelText: string;
  readonly submitText: string;
  readonly savingText: string;
}

export const ModalFormActions: React.FC<ModalFormActionsProps> = ({
  onClose,
  isSubmitting,
  cancelText,
  submitText,
  savingText,
}) => {
  return (
    <div className={styles.modalActions}>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-regular inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{savingText}</span>
          </>
        ) : (
          <span>{submitText}</span>
        )}
      </button>
    </div>
  );
};

export default ModalFormActions;
