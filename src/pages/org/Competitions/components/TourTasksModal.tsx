import { ConfirmModal } from '@components/ConfirmModal';
import { DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from '@mui/joy';
import type {
  DetailedTaskAssignmentResponseDTO,
  TaskAssignmentResponseDTO,
} from '@shared/models/taskAssignment';
import type { TourResponse } from '@shared/models/tour';
import { taskAssignmentService } from '@shared/services/taskAssignmentService';
import { Award, FileText, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import AssignTaskFormModal from './AssignTaskFormModal';
import TourExecutionStatusBadge from './TourExecutionStatusBadge';

export interface TourTasksModalProps {
  readonly isOpen: boolean;
  readonly tour: TourResponse;
  readonly onClose: () => void;
  readonly onTasksCountChanged?: (tourId: number, count: number, totalPoints: number) => void;
}

export const TourTasksModal: React.FC<TourTasksModalProps> = ({
  isOpen,
  tour,
  onClose,
  onTasksCountChanged,
}) => {
  const { t } = useTranslation('admin');
  const [tasks, setTasks] = useState<TaskAssignmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<DetailedTaskAssignmentResponseDTO | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<TaskAssignmentResponseDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isLocked = tour.executionStatus !== 'SCHEDULED';

  const loadAssignments = useCallback(async () => {
    if (!tour.id) return;
    setLoading(true);
    try {
      const data = await taskAssignmentService.getTourAssignments(tour.id);
      setTasks(data);
      const totalScore = data.reduce((acc, curr) => acc + (curr.maxPoints || 0), 0);
      onTasksCountChanged?.(tour.id, data.length, totalScore);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [tour.id, onTasksCountChanged]);

  useEffect(() => {
    if (isOpen) {
      loadAssignments();
    }
  }, [isOpen, loadAssignments]);

  const handleOpenEdit = async (assignment: TaskAssignmentResponseDTO) => {
    try {
      const details = await taskAssignmentService.getAssignmentDetails(assignment.id);
      setEditingAssignment(details);
      setOpenAssignModal(true);
    } catch {
      toast.error(t('tours.tasks.loadDetailsError'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await taskAssignmentService.deleteAssignment(taskToDelete.id);
      toast.success(t('tours.tasks.deleteSuccess'));
      setTaskToDelete(null);
      loadAssignments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || t('tours.tasks.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const totalPoints = tasks.reduce((sum, item) => sum + (item.maxPoints || 0), 0);

  const renderContent = () => {
    if (loading) {
      return (
        <p className="text-center py-8 text-xs text-gray-500">{t('tours.tasks.loading')}</p>
      );
    }

    if (tasks.length === 0) {
      return (
        <div className="text-center py-10 px-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-300">
          <FileText size={32} className="mx-auto text-gray-400 mb-2" />
          <h5 className="font-semibold text-sm text-gray-700 mb-1">
            {t('tours.tasks.emptyTitle')}
          </h5>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {t('tours.tasks.emptyDescription')}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2.5">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200/90 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md shrink-0 mt-0.5">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <h6 className="font-semibold text-sm text-gray-900 truncate">
                  {task.taskTitle}
                </h6>
                <span className="text-[11px] text-gray-400">
                  {t('tours.tasks.bankTaskId', { id: task.taskBodyId })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {task.maxPoints} {t('tours.tasks.pointsUnit')}
              </span>

              {!isLocked && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                    title={t('tours.tasks.editTooltip')}
                    aria-label={t('tours.tasks.editTooltip')}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskToDelete(task)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                    title={t('tours.tasks.detachTooltip')}
                    aria-label={t('tours.tasks.detachTooltip')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal open={isOpen} onClose={onClose}>
        <ModalDialog layout="center" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <ModalClose />
          <DialogTitle className="flex flex-col gap-1 border-b pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-bold text-gray-900">
                {t('tours.tasks.title')}: {tour.title}
              </span>
              <TourExecutionStatusBadge status={tour.executionStatus} />
            </div>
            <p className="text-xs text-gray-500">{t('tours.tasks.subtitle')}</p>
          </DialogTitle>

          <DialogContent className="pt-4 flex flex-col gap-4">
            {/* Lock warning banner */}
            {isLocked && (
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-xs">
                <Lock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>{t('tours.tasks.lockedWarning')}</span>
              </div>
            )}

            {/* Actions and statistics bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                <span>{t('tours.tasks.badgeCount', { count: tasks.length })}</span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <Award size={14} />
                  {t('tours.tasks.totalScore', { points: totalPoints })}
                </span>
              </div>

              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  setEditingAssignment(null);
                  setOpenAssignModal(true);
                }}
                className="btn-regular inline-flex items-center gap-1 text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={isLocked ? t('tours.tasks.lockedTooltip') : ''}
              >
                <Plus size={14} />
                <span>{t('tours.tasks.assignButton')}</span>
              </button>
            </div>

            {renderContent()}
          </DialogContent>
        </ModalDialog>
      </Modal>

      <AssignTaskFormModal
        isOpen={openAssignModal}
        tourId={tour.id}
        initialAssignment={editingAssignment}
        assignedTaskBodyIds={tasks.map(tItem => tItem.taskBodyId)}
        onClose={() => {
          setOpenAssignModal(false);
          setEditingAssignment(null);
        }}
        onSuccess={loadAssignments}
      />

      <ConfirmModal
        open={Boolean(taskToDelete)}
        title={t('tours.tasks.deleteConfirmTitle')}
        message={
          <p className="text-sm">
            {t('tours.tasks.deleteConfirmMessage', {
              title: taskToDelete?.taskTitle,
            })}
          </p>
        }
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setTaskToDelete(null)}
      />
    </>
  );
};

export default TourTasksModal;
