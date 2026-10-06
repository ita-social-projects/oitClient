import type {
  CreateTourRequest,
  TourResponse,
  UpdateTourRequest,
} from '@shared/models/tour';
import { tourService } from '@shared/services/tourService';
import { toLocalDatetimeInputValue, validateDateRange } from '@utils/dateUtils';
import { MapPin, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { DateRangeFields } from './DateRangeFields';
import { ModalFormActions } from './ModalFormActions';
import styles from './Stages.module.scss';

interface TourFormModalProps {
  readonly open: boolean;
  readonly stageId: number;
  readonly stageDates: {
    dateStart: string;
    dateFinish: string;
  };
  readonly initialTour: TourResponse | null;
  readonly existingTours: TourResponse[];
  readonly onClose: () => void;
  readonly onSuccess: (tour: TourResponse) => void;
}

export const TourFormModal: React.FC<TourFormModalProps> = ({
  open,
  stageId,
  stageDates,
  initialTour,
  existingTours,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('admin');
  const isEditMode = Boolean(initialTour);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateFinish, setDateFinish] = useState('');
  const [description, setDescription] = useState('');
  const [sortPosition, setSortPosition] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (initialTour) {
      setTitle(initialTour.title);
      setLocation(initialTour.location);
      setDateStart(toLocalDatetimeInputValue(initialTour.dateStart));
      setDateFinish(toLocalDatetimeInputValue(initialTour.dateFinish));
      setDescription(initialTour.description || '');
      setSortPosition(initialTour.sortPosition);
    } else {
      setTitle('');
      setLocation('');
      setDateStart(toLocalDatetimeInputValue(stageDates.dateStart));
      setDateFinish(toLocalDatetimeInputValue(stageDates.dateFinish));
      setDescription('');
      setSortPosition(undefined);
    }

    setTitleError(null);
    setLocationError(null);
    setDateError(null);
  }, [open, initialTour, stageDates.dateStart, stageDates.dateFinish]);

  if (!open) return null;

  const validate = (): boolean => {
    let isValid = true;
    const trimmedTitle = title.trim();
    const trimmedLoc = location.trim();

    if (!trimmedTitle) {
      setTitleError(t('tours.validation.titleRequired'));
      isValid = false;
    } else if (trimmedTitle.length < 3) {
      setTitleError(t('tours.validation.titleMinLength'));
      isValid = false;
    } else if (trimmedTitle.length > 255) {
      setTitleError(t('tours.validation.titleMaxLength'));
      isValid = false;
    } else {
      const isDuplicate = existingTours.some(
        (tour) =>
          (!initialTour || tour.id !== initialTour.id) &&
          tour.title.toLowerCase() === trimmedTitle.toLowerCase()
      );
      if (isDuplicate) {
        setTitleError(t('tours.validation.duplicateTitle'));
        isValid = false;
      } else {
        setTitleError(null);
      }
    }

    if (!trimmedLoc) {
      setLocationError(t('tours.validation.locationRequired'));
      isValid = false;
    } else {
      setLocationError(null);
    }

    const dateErr = validateDateRange({
      dateStart,
      dateFinish,
      parentDateStart: stageDates.dateStart,
      parentDateFinish: stageDates.dateFinish,
      emptyError: t('tours.validation.datesRequired'),
      finishBeforeStartError: t('tours.validation.finishMustBeAfterStart'),
      outOfBoundsError: ({ start, finish }) =>
        t('tours.validation.datesOutOfBounds', { start, finish }),
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

      if (isEditMode && initialTour) {
        const payload: UpdateTourRequest = {
          title: title.trim(),
          description: trimmedDesc,
          dateStart: isoStart,
          dateFinish: isoFinish,
          location: location.trim(),
          sortPosition,
          version: initialTour.version,
        };
        const updated = await tourService.updateTour(stageId, initialTour.id, payload);
        toast.success(t('tours.validation.updateSuccess'));
        onSuccess(updated);
        onClose();
      } else {
        const payload: CreateTourRequest = {
          title: title.trim(),
          description: trimmedDesc,
          dateStart: isoStart,
          dateFinish: isoFinish,
          location: location.trim(),
        };
        const created = await tourService.createTour(stageId, payload);
        toast.success(t('tours.validation.createSuccess'));
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(t('tours.validation.conflictError'));
        onClose();
      } else {
        const backendMessage = err?.response?.data?.message;
        toast.error(backendMessage || t('tours.validation.loadError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className="font-semibold text-lg text-gray-900">
            {isEditMode ? t('tours.modal.editTitle') : t('tours.modal.createTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label htmlFor="tour-title" className={styles.fieldLabel}>
              {t('tours.modal.titleLabel')}
              <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              id="tour-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder={t('tours.modal.titlePlaceholder')}
              className={`${styles.input} ${titleError ? styles.inputInvalid : ''}`}
              maxLength={255}
            />
            {titleError && <span className={styles.fieldError}>{titleError}</span>}
          </div>

          {/* Location */}
          <div className={styles.fieldGroup}>
            <label htmlFor="tour-location" className={styles.fieldLabel}>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                <span>{t('tours.modal.locationLabel')}</span>
                <span className={styles.requiredAsterisk}>*</span>
              </span>
            </label>
            <input
              id="tour-location"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (locationError) setLocationError(null);
              }}
              placeholder={t('tours.modal.locationPlaceholder')}
              className={`${styles.input} ${locationError ? styles.inputInvalid : ''}`}
            />
            {locationError && <span className={styles.fieldError}>{locationError}</span>}
          </div>

          {/* Dates */}
          <DateRangeFields
            idPrefix="tour"
            startLabel={t('tours.modal.dateStartLabel')}
            finishLabel={t('tours.modal.dateFinishLabel')}
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
              <label htmlFor="tour-sort-position" className={styles.fieldLabel}>
                {t('tours.modal.sortPositionLabel')}
              </label>
              <input
                id="tour-sort-position"
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
            <label htmlFor="tour-description" className={styles.fieldLabel}>
              {t('tours.modal.descriptionLabel')}
            </label>
            <textarea
              id="tour-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('tours.modal.descriptionPlaceholder')}
              className={styles.textarea}
            />
          </div>

          <ModalFormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
            cancelText={t('tours.modal.cancelButton')}
            submitText={isEditMode ? t('tours.modal.saveButton') : t('tours.modal.createButton')}
            savingText={t('tours.modal.saving')}
          />
        </form>
      </div>
    </div>
  );
};

export default TourFormModal;
