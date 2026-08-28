import { BackButton } from '@components/BackButton.tsx';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
} from '@mui/joy';
import { taskService } from '@services/taskService.ts';
import type {
  FileDetailsDTO,
  TaskFileRole,
  PendingFile,
  TaskApiError,
} from '@shared/models/task.ts';
import { TASK_TITLE_MAX_LENGTH } from '@shared/models/task.ts';
import type { AxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import TaskFileUpload from './TaskFileUpload.tsx';


interface TaskFormData {
  title: string;
  description: string;
}

const TaskForm: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<TaskFormData>({ mode: 'onChange' });

  const [existingFiles, setExistingFiles] = useState<FileDetailsDTO[]>([]);
  const [initialFiles, setInitialFiles] = useState<FileDetailsDTO[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([]);
  const [taskVersion, setTaskVersion] = useState<number>(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<TaskFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadTask = async () => {
      try {
        const task = await taskService.getTaskById(Number(id));
        if (cancelled) return;
        reset({ title: task.title, description: task.description ?? '' });
        setExistingFiles(task.files);
        setInitialFiles(task.files);
        setTaskVersion(task.version);
      } catch {
        if (cancelled) return;
        toast.error(t('task-form.updateFailed'));
        navigate('/profile/tasks');
      }
    };
    loadTask();

    return () => {cancelled = true;};
  }, [id, reset, navigate, t]);

  const handlePendingAdd = useCallback((files: PendingFile[]) => {
    setPendingFiles(prev => [...prev, ...files]);
  }, []);

  const handlePendingRemove = useCallback((tempId: string) => {
    setPendingFiles(prev => prev.filter(pf => pf.tempId !== tempId));
  }, []);

  const handlePendingRoleChange = useCallback((tempId: string, role: TaskFileRole) => {
    setPendingFiles(prev => prev.map(pf => (pf.tempId === tempId ? { ...pf, role } : pf)));
  }, []);

  const handleExistingRemove = useCallback((fileId: number) => {
    setRemovedFileIds(prev => [...prev, fileId]);
  }, []);

  const handleExistingRoleChange = useCallback((fileId: number, role: TaskFileRole) => {
    setExistingFiles(prev => prev.map(f => (f.id === fileId ? { ...f, fileRole: role } : f)));
  }, []);

  const visibleExisting = existingFiles.filter(f => !removedFileIds.includes(f.id));
  const allFilesMarked =
    visibleExisting.every(f => f.fileRole) && pendingFiles.every(pf => pf.role !== null);

  const canSubmit = isValid && allFilesMarked;

  const onFormSubmit = (data: TaskFormData) => {
    (document.activeElement as HTMLElement)?.blur();
    setPendingSubmitData(data);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingSubmitData || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newFileIds: number[] = [];

      const roleGroups: Record<string, File[]> = {};
      for (const pf of pendingFiles) {
        const role = pf.role as TaskFileRole;
        if (!roleGroups[role]) roleGroups[role] = [];
        roleGroups[role].push(pf.file);
      }

      for (const [role, files] of Object.entries(roleGroups)) {
        const { data: uploaded } = await taskService.uploadFiles(files, role as TaskFileRole);
        newFileIds.push(...uploaded.map(f => f.id));
      }

      if (isEditMode) {
        const keptExistingIds = visibleExisting.map(f => f.id);
        const allFileIds = [...keptExistingIds, ...newFileIds];
        const filesChanged = removedFileIds.length > 0 || newFileIds.length > 0;

        const roleUpdatePromises = visibleExisting.map(async file => {
          const initialFile = initialFiles.find(f => f.id === file.id);
          if (initialFile && initialFile.fileRole !== file.fileRole && file.fileRole) {
            return taskService.updateFileRole(file.id, file.fileRole);
          }
        });

        await Promise.all(roleUpdatePromises);

        await taskService.updateTask(Number(id), {
          title: pendingSubmitData.title,
          description: pendingSubmitData.description || undefined,
          ...(filesChanged ? { fileIds: allFileIds, removedFileIds } : {}),
          version: taskVersion,
        });

        toast.success(t('task-form.updatedSuccessfully'));
        navigate(`/profile/tasks/${id}`);
      } else {
        await taskService.createTask({
          title: pendingSubmitData.title,
          description: pendingSubmitData.description || undefined,
          fileIds: newFileIds,
        });

        toast.success(t('task-form.createdSuccessfully'));
        navigate('/profile/tasks');
      }
    } catch (error: unknown) {
      const err = error as AxiosError<TaskApiError>;
      const backendMessage = err.response?.data?.message;
      toast.error(
        backendMessage || (isEditMode ? t('task-form.updateFailed') : t('task-form.createFailed')),
      );
    } finally {
      setIsSubmitting(false);
      setModalOpen(false);
      setPendingSubmitData(null);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setPendingSubmitData(null);
  };

  return (
    <div className="bg-linear-to-br from-blue-50 to-purple-50 min-h-dvh flex items-center justify-center px-4 py-10 sm:py-20">
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="bg-white w-full sm:w-[70%] shadow-lg rounded-2xl p-4 sm:p-8 flex flex-col gap-5 sm:gap-6"
      >
        <BackButton text={t('task-detail.back')} to="/profile/tasks" />

        <h1 className="text-center text-xl sm:text-[1.8rem]">
          {isEditMode ? t('task-form.editTitle') : t('task-form.createTitle')}
        </h1>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-title-input" className="text-sm font-medium">
            {t('task-form.titleLabel')}
          </label>
          <input
            id="task-title-input"
            {...register('title', {
              required: t('task-form.titleRequired'),
              maxLength: {
                value: TASK_TITLE_MAX_LENGTH,
                message: t('task-form.titleMaxLength'),
              },
            })}
            placeholder={t('task-form.titlePlaceholder')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          {errors.title && (
            <span className="text-xs text-red-500 font-medium">{errors.title.message}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-desc-textarea" className="text-sm font-medium">
            {t('task-form.descriptionLabel')}
          </label>
          <textarea
            id="task-desc-textarea"
            {...register('description')}
            placeholder={t('task-form.descriptionPlaceholder')}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none resize-y min-h-24 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <span className="text-xs text-gray-400">{t('task-form.descriptionHint')}</span>
        </div>

        {/* File attachments */}
        <TaskFileUpload
          existingFiles={existingFiles}
          pendingFiles={pendingFiles}
          removedFileIds={removedFileIds}
          onExistingRemove={handleExistingRemove}
          onPendingAdd={handlePendingAdd}
          onPendingRemove={handlePendingRemove}
          onPendingRoleChange={handlePendingRoleChange}
          onExistingRoleChange={handleExistingRoleChange}
        />

        {/* Submit */}
        <button
          type="submit"
          className="btn-regular w-full sm:w-50 sm:ml-auto mt-auto"
          disabled={!canSubmit}
        >
          {isEditMode ? t('task-form.saveButton') : t('task-form.createButton')}
        </button>
      </form>

      {/* Confirmation modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>{t('task-form.confirmTitle')}</DialogTitle>
          <DialogContent>
            {isEditMode ? t('task-form.confirmUpdate') : t('task-form.confirmCreate')}
          </DialogContent>
          <DialogActions>
            <button
              type="button"
              className="btn-regular"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {t('task-form.confirmYes')}
            </button>
            <button type="button" className="btn" onClick={handleCancel} disabled={isSubmitting}>
              {t('task-form.confirmNo')}
            </button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default TaskForm;
