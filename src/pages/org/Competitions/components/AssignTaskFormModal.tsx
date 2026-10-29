import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
} from '@mui/joy';
import type {
  AssignmentVisibility,
  CreateTaskAssignmentRequestDTO,
  DetailedTaskAssignmentResponseDTO,
  RequiredFileRule,
  UpdateTaskAssignmentRequestDTO,
} from '@shared/models/taskAssignment';
import { taskAssignmentService } from '@shared/services/taskAssignmentService';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import RequiredFilesBuilder, { type RequiredFileRuleErrors } from './RequiredFilesBuilder';
import { TaskSearchSelect } from './TaskSearchSelect';

export interface AssignTaskFormModalProps {
  readonly isOpen: boolean;
  readonly tourId: number;
  readonly initialAssignment?: DetailedTaskAssignmentResponseDTO | null;
  readonly assignedTaskBodyIds?: number[];
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

interface FormErrors {
  task?: string;
  points?: string;
  generalRules?: string;
  rules?: Record<number, RequiredFileRuleErrors>;
}

const createDefaultRule = (prompt: string): RequiredFileRule => ({
  id: crypto.randomUUID(),
  prompt,
  namingRule: 'Solution',
  allowedExtensions: ['.zip', '.py', '.cpp'],
  maxFileSizeMb: 20,
});

export const AssignTaskFormModal: React.FC<AssignTaskFormModalProps> = ({
  isOpen,
  tourId,
  initialAssignment,
  assignedTaskBodyIds = [],
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('admin');
  const isEditMode = Boolean(initialAssignment);

  const defaultRule = React.useMemo(
    () => createDefaultRule(t('tours.tasks.defaultPrompt')),
    [t],
  );

  const [selectedTaskBodyId, setSelectedTaskBodyId] = useState<number | ''>('');
  const [maxPoints, setMaxPoints] = useState<number | ''>(100);
  const [visibility, setVisibility] = useState<AssignmentVisibility>('VISIBLE');
  const [rules, setRules] = useState<RequiredFileRule[]>([defaultRule]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    if (initialAssignment) {
      setSelectedTaskBodyId(initialAssignment.taskBodyId);
      setMaxPoints(initialAssignment.maxPoints);
      setVisibility(initialAssignment.visibility);
      setRules(
        initialAssignment.requirements?.requiredFiles?.length
          ? initialAssignment.requirements.requiredFiles.map(r => ({
              ...r,
              id: r.id || crypto.randomUUID(),
            }))
          : [defaultRule],
      );
    } else {
      setSelectedTaskBodyId('');
      setMaxPoints(100);
      setVisibility('VISIBLE');
      setRules([defaultRule]);
    }
  }, [isOpen, initialAssignment, defaultRule]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!isEditMode && !selectedTaskBodyId) {
      nextErrors.task = t('tours.tasks.validation.taskRequired');
    } else if (
      !isEditMode &&
      selectedTaskBodyId &&
      assignedTaskBodyIds.includes(Number(selectedTaskBodyId))
    ) {
      nextErrors.task = t('tours.tasks.validation.taskAlreadyAssigned');
    }

    const pointsNum = typeof maxPoints === 'number' ? maxPoints : Number.parseInt(maxPoints, 10);
    if (maxPoints === '' || Number.isNaN(pointsNum) || pointsNum < 1) {
      nextErrors.points = t('tours.tasks.validation.pointsMin');
    } else if (pointsNum > 120) {
      nextErrors.points = t('tours.tasks.validation.pointsMax');
    }

    if (!rules.length) {
      nextErrors.generalRules = t('tours.tasks.validation.atLeastOneRule');
    } else {
      const ruleErrorsMap: Record<number, RequiredFileRuleErrors> = {};
      let hasRuleError = false;

      rules.forEach((rule, idx) => {
        const itemErr: RequiredFileRuleErrors = {};
        if (!rule.prompt.trim()) {
          itemErr.prompt = t('tours.tasks.validation.promptRequired');
          hasRuleError = true;
        }
        if (!rule.namingRule.trim()) {
          itemErr.namingRule = t('tours.tasks.validation.namingRequired');
          hasRuleError = true;
        }
        if (!rule.allowedExtensions.length) {
          itemErr.allowedExtensions = t('tours.tasks.validation.extensionsRequired');
          hasRuleError = true;
        }
        if (rule.maxFileSizeMb < 1) {
          itemErr.maxFileSizeMb = t('tours.tasks.validation.fileSizeMin');
          hasRuleError = true;
        } else if (rule.maxFileSizeMb > 200) {
          itemErr.maxFileSizeMb = t('tours.tasks.validation.fileSizeMax');
          hasRuleError = true;
        }

        if (Object.keys(itemErr).length > 0) {
          ruleErrorsMap[idx] = itemErr;
        }
      });

      if (hasRuleError) {
        nextErrors.rules = ruleErrorsMap;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const cleanRules = rules.map(({ id: _, ...rest }) => rest);

      if (isEditMode && initialAssignment) {
        const payload: UpdateTaskAssignmentRequestDTO = {
          maxPoints: Number(maxPoints),
          visibility,
          requirements: { requiredFiles: cleanRules },
          version: initialAssignment.version,
        };
        await taskAssignmentService.updateAssignment(initialAssignment.id, payload);
        toast.success(t('tours.tasks.updateSuccess'));
      } else {
        const payload: CreateTaskAssignmentRequestDTO = {
          taskBodyId: Number(selectedTaskBodyId),
          maxPoints: Number(maxPoints),
          visibility,
          requirements: { requiredFiles: cleanRules },
        };
        await taskAssignmentService.assignTask(tourId, payload);
        toast.success(t('tours.tasks.assignSuccess'));
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error?.response?.status === 409) {
        toast.error(t('tours.tasks.conflictError'));
        onSuccess();
        onClose();
      } else {
        toast.error(
          error?.response?.data?.message ||
            (isEditMode ? t('tours.tasks.updateError') : t('tours.tasks.assignError')),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmitButtonText = (): string => {
    if (submitting) {
      return t('tours.tasks.saving');
    }
    if (isEditMode) {
      return t('tours.tasks.saveButton');
    }
    return t('tours.tasks.submitAssignButton');
  };

  const renderTaskSelector = () => (
    <TaskSearchSelect
      value={selectedTaskBodyId}
      onChange={task => {
        setSelectedTaskBodyId(task ? task.id : '');
        if (errors.task) {
          setErrors(prev => ({ ...prev, task: undefined }));
        }
      }}
      assignedTaskBodyIds={assignedTaskBodyIds}
      error={errors.task}
    />
  );

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog layout="center" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <ModalClose />
        <DialogTitle className="text-lg font-bold text-gray-900 border-b pb-3">
          {isEditMode ? t('tours.tasks.editModalTitle') : t('tours.tasks.assignModalTitle')}
        </DialogTitle>

        <DialogContent className="pt-4">
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Task selection from bank */}
            {!isEditMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('tours.tasks.selectTaskLabel')} <span className="text-red-500">*</span>
                </label>
                {renderTaskSelector()}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('tours.tasks.maxPointsLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={maxPoints}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setMaxPoints('');
                    } else {
                      const num = Number.parseInt(val, 10);
                      setMaxPoints(Number.isNaN(num) ? '' : num);
                    }
                    if (errors.points) {
                      setErrors(prev => ({ ...prev, points: undefined }));
                    }
                  }}
                  className={`w-full text-xs px-3 py-2 bg-white border rounded focus:outline-none transition-colors ${
                    errors.points
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
                {errors.points ? (
                  <span className="text-[11px] text-red-500 font-medium block mt-1">
                    {errors.points}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {t('tours.tasks.maxPointsHint')}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('tours.tasks.visibilityLabel')}
                </label>
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value as AssignmentVisibility)}
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="VISIBLE">{t('tours.tasks.visibilityVisible')}</option>
                  <option value="HIDDEN">{t('tours.tasks.visibilityHidden')}</option>
                </select>
              </div>
            </div>

            <RequiredFilesBuilder
              rules={rules}
              onChange={newRules => {
                setRules(newRules);
                if (errors.rules || errors.generalRules) {
                  setErrors(prev => ({ ...prev, rules: undefined, generalRules: undefined }));
                }
              }}
              ruleErrors={errors.rules}
            />
            {errors.generalRules && (
              <span className="text-xs text-red-500 font-medium block -mt-2">
                {errors.generalRules}
              </span>
            )}

            <DialogActions className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn-regular text-xs py-1.5 px-3 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
              >
                {t('tours.tasks.cancelButton')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-regular text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer disabled:opacity-50"
              >
                {getSubmitButtonText()}
              </button>
            </DialogActions>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default AssignTaskFormModal;
