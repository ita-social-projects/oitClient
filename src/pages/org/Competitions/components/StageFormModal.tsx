import type {
  CreateStageRequest,
  StageResponse,
  StageScope,
  UpdateStageRequest,
} from '@shared/models/stage';
import { STAGE_SCOPES } from '@shared/models/stage';
import { stageService } from '@shared/services/stageService';
import { Calendar, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import styles from './Stages.module.scss';

interface StageFormModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (stage: StageResponse) => void;
  readonly competitionId: number;
  readonly competitionDates: {
    dateStart: string;
    dateFinish: string;
  };
  readonly initialStage: StageResponse | null;
  readonly existingStages: StageResponse[];
}

const toLocalDatetimeInputValue = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  try {
    const date = new Date(isoStr);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

export const StageFormModal: React.FC<StageFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  competitionId,
  competitionDates,
  initialStage,
  existingStages,
}) => {
  const { t } = useTranslation('admin');
  const isEditMode = Boolean(initialStage);

  const [title, setTitle] = useState('');
  const [scope, setScope] = useState<StageScope>('CITY');
  const [dateStart, setDateStart] = useState('');
  const [dateFinish, setDateFinish] = useState('');
  const [description, setDescription] = useState('');
  const [sortPosition, setSortPosition] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [scopeError, setScopeError] = useState<string | null>(null);

  const usedScopes = React.useMemo(
    () =>
      existingStages
        .filter((s) => !initialStage || s.id !== initialStage.id)
        .map((s) => s.scope),
    [existingStages, initialStage]
  );

  useEffect(() => {
    if (!open) return;

    if (initialStage) {
      setTitle(initialStage.title);
      setScope(initialStage.scope);
      setDateStart(toLocalDatetimeInputValue(initialStage.dateStart));
      setDateFinish(toLocalDatetimeInputValue(initialStage.dateFinish));
      setDescription(initialStage.description || '');
      setSortPosition(initialStage.sortPosition);
    } else {
      setTitle('');
      const firstAvailableScope = STAGE_SCOPES.find((s) => !usedScopes.includes(s)) || 'CITY';
      setScope(firstAvailableScope);
      setDateStart(toLocalDatetimeInputValue(competitionDates.dateStart));
      setDateFinish(toLocalDatetimeInputValue(competitionDates.dateFinish));
      setDescription('');
      setSortPosition(undefined);
    }

    setTitleError(null);
    setDateError(null);
    setScopeError(null);
  }, [open, initialStage, competitionDates, usedScopes]);

  if (!open) return null;

  const validate = (): boolean => {
    let isValid = true;
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError(t('stages.validation.titleRequired'));
      isValid = false;
    } else if (trimmedTitle.length < 3) {
      setTitleError(t('stages.validation.titleMinLength'));
      isValid = false;
    } else if (trimmedTitle.length > 255) {
      setTitleError(t('stages.validation.titleMaxLength'));
      isValid = false;
    } else {
      const isDuplicateTitle = existingStages.some(
        (s) => (!initialStage || s.id !== initialStage.id) && s.title.toLowerCase() === trimmedTitle.toLowerCase()
      );
      if (isDuplicateTitle) {
        setTitleError(t('stages.validation.titleExists'));
        isValid = false;
      } else {
        setTitleError(null);
      }
    }

    if (usedScopes.includes(scope)) {
      setScopeError(t('stages.validation.scopeAlreadyExists'));
      isValid = false;
    } else {
      setScopeError(null);
    }

    if (!dateStart || !dateFinish) {
      setDateError(t('stages.validation.datesRequired'));
      isValid = false;
    } else {
      const start = new Date(dateStart);
      const finish = new Date(dateFinish);
      const compStart = new Date(competitionDates.dateStart);
      const compFinish = new Date(competitionDates.dateFinish);

      if (finish <= start) {
        setDateError(t('stages.validation.dateFinishAfterStart'));
        isValid = false;
      } else if (start < compStart || finish > compFinish) {
        setDateError(
          t('stages.validation.datesOutOfCompetitionBounds', {
            start: compStart.toLocaleDateString(),
            finish: compFinish.toLocaleDateString(),
          })
        );
        isValid = false;
      } else {
        setDateError(null);
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const isoStart = new Date(dateStart).toISOString();
      const isoFinish = new Date(dateFinish).toISOString();
      const trimmedDesc = description.trim() ? description.trim() : null;

      if (isEditMode && initialStage) {
        const payload: UpdateStageRequest = {
          title: title.trim(),
          description: trimmedDesc,
          dateStart: isoStart,
          dateFinish: isoFinish,
          scope,
          sortPosition: sortPosition ?? initialStage.sortPosition,
          version: initialStage.version,
        };
        const updated = await stageService.updateStage(competitionId, initialStage.id, payload);
        toast.success(t('stages.validation.updateSuccess'));
        onSuccess(updated);
        onClose();
      } else {
        const payload: CreateStageRequest = {
          title: title.trim(),
          description: trimmedDesc,
          dateStart: isoStart,
          dateFinish: isoFinish,
          scope,
        };
        const created = await stageService.createStage(competitionId, payload);
        toast.success(t('stages.validation.createSuccess'));
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(t('stages.validation.conflictError'));
        onClose();
      } else {
        const backendMessage = err?.response?.data?.message;
        toast.error(backendMessage || t('stages.validation.loadError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      open
      className={styles.modalOverlay}
      aria-labelledby="stage-form-title"
    >
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 id="stage-form-title" className="font-semibold text-lg text-gray-900">
            {isEditMode ? t('stages.modal.editTitle') : t('stages.modal.createTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label htmlFor="stage-title" className={styles.fieldLabel}>
              {t('stages.modal.titleLabel')}
              <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              id="stage-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder={t('stages.modal.titlePlaceholder')}
              className={`${styles.input} ${titleError ? styles.inputInvalid : ''}`}
              maxLength={255}
            />
            {titleError && <span className={styles.fieldError}>{titleError}</span>}
          </div>

          {/* Scope */}
          <div className={styles.fieldGroup}>
            <label htmlFor="stage-scope" className={styles.fieldLabel}>
              {t('stages.modal.scopeLabel')}
              <span className={styles.requiredAsterisk}>*</span>
            </label>
            <select
              id="stage-scope"
              value={scope}
              onChange={(e) => {
                setScope(e.target.value as StageScope);
                if (scopeError) setScopeError(null);
              }}
              className={`${styles.select} ${scopeError ? styles.inputInvalid : ''}`}
            >
              {STAGE_SCOPES.map((sc) => {
                const isUsed = usedScopes.includes(sc);
                return (
                  <option key={sc} value={sc} disabled={isUsed}>
                    {t(`stages.scope.${sc}`)} {isUsed ? t('stages.modal.scopeUsed') : ''}
                  </option>
                );
              })}
            </select>
            {scopeError && <span className={styles.fieldError}>{scopeError}</span>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={styles.fieldGroup}>
              <label htmlFor="stage-date-start" className={styles.fieldLabel}>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{t('stages.modal.dateStartLabel')}</span>
                  <span className={styles.requiredAsterisk}>*</span>
                </span>
              </label>
              <input
                id="stage-date-start"
                type="datetime-local"
                value={dateStart}
                onChange={(e) => {
                  setDateStart(e.target.value);
                  if (dateError) setDateError(null);
                }}
                className={`${styles.input} ${dateError ? styles.inputInvalid : ''}`}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="stage-date-finish" className={styles.fieldLabel}>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{t('stages.modal.dateFinishLabel')}</span>
                  <span className={styles.requiredAsterisk}>*</span>
                </span>
              </label>
              <input
                id="stage-date-finish"
                type="datetime-local"
                value={dateFinish}
                onChange={(e) => {
                  setDateFinish(e.target.value);
                  if (dateError) setDateError(null);
                }}
                className={`${styles.input} ${dateError ? styles.inputInvalid : ''}`}
              />
            </div>
          </div>
          {dateError && <span className={styles.fieldError}>{dateError}</span>}

          {/* Sort Position (Edit mode only) */}
          {isEditMode && (
            <div className={styles.fieldGroup}>
              <label htmlFor="stage-sort-position" className={styles.fieldLabel}>
                {t('stages.modal.sortPositionLabel')}
              </label>
              <input
                id="stage-sort-position"
                type="number"
                min={1}
                value={sortPosition ?? ''}
                onChange={(e) => setSortPosition(Number(e.target.value) || 1)}
                className={styles.input}
              />
            </div>
          )}

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label htmlFor="stage-description" className={styles.fieldLabel}>
              {t('stages.modal.descriptionLabel')}
            </label>
            <textarea
              id="stage-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('stages.modal.descriptionPlaceholder')}
              className={styles.textarea}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              {t('stages.modal.cancelButton')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-regular inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('stages.modal.saving')}</span>
                </>
              ) : (
                <span>
                  {isEditMode ? t('stages.modal.saveButton') : t('stages.modal.createButton')}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default StageFormModal;
