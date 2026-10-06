import type {
  CreateStageRequest,
  StageResponse,
  StageScope,
  UpdateStageRequest,
} from '@shared/models/stage';
import { STAGE_SCOPES } from '@shared/models/stage';
import { stageService } from '@shared/services/stageService';
import { toLocalDatetimeInputValue, validateDateRange } from '@utils/dateUtils';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { DateRangeFields } from './DateRangeFields';
import { ModalFormActions } from './ModalFormActions';
import styles from './Stages.module.scss';

interface StageFormModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (stage: StageResponse) => void;
  readonly onConflict?: () => void;
  readonly competitionId: number;
  readonly competitionDates: {
    dateStart: string;
    dateFinish: string;
  };
  readonly initialStage: StageResponse | null;
  readonly existingStages: StageResponse[];
}

export const StageFormModal: React.FC<StageFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  onConflict,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialStage?.id]);

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

    const dateErr = validateDateRange({
      dateStart,
      dateFinish,
      parentDateStart: competitionDates.dateStart,
      parentDateFinish: competitionDates.dateFinish,
      emptyError: t('stages.validation.datesRequired'),
      finishBeforeStartError: t('stages.validation.dateFinishAfterStart'),
      outOfBoundsError: ({ start, finish }) =>
        t('stages.validation.datesOutOfCompetitionBounds', { start, finish }),
    });
    if (dateErr) {
      setDateError(dateErr);
      isValid = false;
    } else {
      setDateError(null);
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
        onConflict?.();
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
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 id="stage-form-title" className="font-semibold text-lg text-gray-900">
            {isEditMode ? t('stages.modal.editTitle') : t('stages.modal.createTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
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
          <DateRangeFields
            idPrefix="stage"
            startLabel={t('stages.modal.dateStartLabel')}
            finishLabel={t('stages.modal.dateFinishLabel')}
            dateStart={dateStart}
            dateFinish={dateFinish}
            onChangeStart={(val) => {
              setDateStart(val);
              if (dateError) setDateError(null);
            }}
            onChangeFinish={(val) => {
              setDateFinish(val);
              if (dateError) setDateError(null);
            }}
            dateError={dateError}
          />

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

          <ModalFormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
            cancelText={t('stages.modal.cancelButton')}
            submitText={isEditMode ? t('stages.modal.saveButton') : t('stages.modal.createButton')}
            savingText={t('stages.modal.saving')}
          />
        </form>
      </div>
    </div>
  );
};

export default StageFormModal;
