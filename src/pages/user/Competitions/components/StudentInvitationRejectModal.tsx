import { DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from '@mui/joy';
import type { InvitationHistoryItem } from '@shared/models/invitation';
import { Loader2, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface StudentInvitationRejectModalProps {
  isOpen: boolean;
  invitation: InvitationHistoryItem | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
}

const MAX_REASON_LENGTH = 500;

export const StudentInvitationRejectModal: React.FC<StudentInvitationRejectModalProps> = ({
  isOpen,
  invitation,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('profile');
  const [reason, setReason] = useState('');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setReason('');
    }
  }

  const handleClose = () => {
    if (isLoading) return;
    setReason('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onConfirm(reason.trim());
  };

  if (!invitation) return null;

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalDialog layout="center" className="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl">
        <ModalClose aria-label="close" disabled={isLoading} />
        <DialogTitle className="text-lg font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span>{t('studentInvitations.modal.rejectTitle')}</span>
        </DialogTitle>

        <DialogContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900">
                {invitation.competition.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {invitation.stage.title}
              </p>
            </div>

            <p className="text-sm text-gray-600">
              {t('studentInvitations.modal.rejectMessage', {
                title: invitation.competition.title,
                stageTitle: invitation.stage.title,
              })}
            </p>

            <div>
              <label
                htmlFor="rejectionReason"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('studentInvitations.modal.reasonLabel')}
              </label>

              <textarea
                id="rejectionReason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
                placeholder={t('studentInvitations.modal.reasonPlaceholder')}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />

              <div className="flex justify-end mt-1 text-xs text-gray-400">
                <span>{reason.length} / {MAX_REASON_LENGTH}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
              >
                {t('studentInvitations.modal.cancel')}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{t('studentInvitations.modal.rejectConfirm')}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default StudentInvitationRejectModal;
