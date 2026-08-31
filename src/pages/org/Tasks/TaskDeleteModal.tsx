import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
} from '@mui/joy';
import { taskService } from '@services/taskService.ts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

type TaskDeleteModalProps = {
  readonly taskId: number;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onDeleted: () => void;
};

export default function TaskDeleteModal({
  taskId,
  open,
  onClose,
  onDeleted,
}: TaskDeleteModalProps) {
  const { t } = useTranslation('admin');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);

    taskService
      .deleteTask(taskId)
      .then(() => {
        toast.success(t('task-delete.deletedSuccessfully'));
        onClose();
        onDeleted();
      })
      .catch(() => {
        onClose();
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <DialogTitle>{t('task-delete.title')}</DialogTitle>
        <DialogContent>{t('task-delete.confirmDelete')}</DialogContent>
        <DialogActions>
          <button
            type="button"
            className="btn-regular"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {t('task-delete.confirmYes')}
          </button>
          <button type="button" className="btn" disabled={isDeleting} onClick={onClose}>
            {t('task-delete.confirmNo')}
          </button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
