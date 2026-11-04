import { DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from '@mui/joy';
import type { UserDto } from '@shared/models/user';
import { enrollmentService } from '@shared/services/enrollmentService';
import { showBatchToast } from '@utils/toastUtils';
import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import StudentSearchSelect from './StudentSearchSelect';

export interface SendInvitationsModalProps {
  readonly isOpen: boolean;
  readonly competitionId: number;
  readonly stageId: number;
  readonly onClose: () => void;
  readonly onInvitationsSent?: () => void;
}

export const SendInvitationsModal: React.FC<SendInvitationsModalProps> = ({
  isOpen,
  competitionId,
  stageId,
  onClose,
  onInvitationsSent,
}) => {
  const { t } = useTranslation('admin');

  const [selectedStudents, setSelectedStudents] = useState<UserDto[]>([]);
  const [manualIds, setManualIds] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setSelectedStudents([]);
    setManualIds('');
    onClose();
  };

  const parsedManualIds = manualIds
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s))
    .map(Number)
    .filter((n) => Number.isSafeInteger(n) && n > 0);

  const allStudentIds = Array.from(
    new Set([...selectedStudents.map((s) => s.id), ...parsedManualIds])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allStudentIds.length === 0 || submitting) return;

    setSubmitting(true);
    try {
      const res = await enrollmentService.sendInvitations(competitionId, stageId, allStudentIds);
      showBatchToast(res, t, 'enrollment.invitations.sendModal.summary');

      setSelectedStudents([]);
      setManualIds('');
      onClose();
      onInvitationsSent?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('stages.validation.loadError');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalDialog layout="center" className="w-full max-w-xl p-6">
        <ModalClose aria-label="close" disabled={submitting} />
        <DialogTitle className="text-lg font-bold text-gray-900 border-b pb-3">
          {t('enrollment.invitations.sendModal.title')}
        </DialogTitle>

        <DialogContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Student Search Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('enrollment.invitations.sendModal.studentsSelectLabel')}
              </label>
              <StudentSearchSelect
                selectedStudents={selectedStudents}
                onChange={setSelectedStudents}
                disabled={submitting}
              />
            </div>

            {/* Manual IDs Input */}
            <div>
              <label htmlFor="manualIds" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('enrollment.invitations.sendModal.manualIdsLabel')}
              </label>
              <input
                id="manualIds"
                type="text"
                value={manualIds}
                onChange={(e) => setManualIds(e.target.value)}
                disabled={submitting}
                placeholder={t('enrollment.invitations.sendModal.manualIdsPlaceholder')}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Total to invite summary */}
            {allStudentIds.length > 0 && (
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-md border border-emerald-200">
                <span>
                  {t('enrollment.invitations.batchSelected', {
                    count: allStudentIds.length,
                    defaultValue: `Усього учнів для запрошення: ${allStudentIds.length}`,
                  })}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                {t('enrollment.invitations.sendModal.cancel')}
              </button>
              <button
                type="submit"
                disabled={allStudentIds.length === 0 || submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send size={15} />
                <span>
                  {submitting ? '...' : t('enrollment.invitations.sendModal.submit')}
                </span>
              </button>
            </div>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default SendInvitationsModal;
