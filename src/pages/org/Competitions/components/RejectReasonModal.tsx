import { DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from '@mui/joy';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface RejectReasonModalProps {
  readonly isOpen: boolean;
  readonly isBatch?: boolean;
  readonly count?: number;
  readonly isLoading?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (reason: string) => Promise<void> | void;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  isBatch = false,
  count = 1,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('admin');
  const [reason, setReason] = useState('');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setReason('');
    }
  }

  const quickReasons = [
    t('enrollment.rejectionModal.quickReasons.notEligible'),
    t('enrollment.rejectionModal.quickReasons.noDocs'),
    t('enrollment.rejectionModal.quickReasons.quotaReached'),
  ];

  const handleClose = () => {
    if (isLoading) return;
    setReason('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason.trim());
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalDialog layout="center" className="w-full max-w-lg p-6">
        <ModalClose aria-label="close" disabled={isLoading} />
        <DialogTitle className="text-lg font-bold text-gray-900 border-b pb-3">
          {isBatch
            ? t('enrollment.rejectionModal.batchTitle', { count })
            : t('enrollment.rejectionModal.title')}
        </DialogTitle>

        <DialogContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('enrollment.rejectionModal.reasonLabel')}
              </label>

              {/* Quick Template Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {quickReasons.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setReason(qr)}
                    disabled={isLoading}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-300 bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    + {qr}
                  </button>
                ))}
              </div>

              <textarea
                id="rejectionReason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('enrollment.rejectionModal.reasonPlaceholder')}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                {t('enrollment.rejectionModal.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <span>...</span>
                ) : (
                  <span>{t('enrollment.rejectionModal.confirm')}</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default RejectReasonModal;
