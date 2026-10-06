import type { TourResponse } from '@shared/models/tour';
import { tourService } from '@shared/services/tourService';
import { ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';


import styles from './Stages.module.scss';

interface TourReorderModalProps {
  readonly open: boolean;
  readonly stageId: number;
  readonly tours: TourResponse[];
  readonly onClose: () => void;
  readonly onSuccess: (updatedTours: TourResponse[]) => void;
}

export const TourReorderModal: React.FC<TourReorderModalProps> = ({
  open,
  stageId,
  tours,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('admin');
  const [orderedTours, setOrderedTours] = useState<TourResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setOrderedTours([...tours].sort((a, b) => a.sortPosition - b.sortPosition));
    }
  }, [open, tours]);

  if (!open) return null;

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setOrderedTours((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= orderedTours.length - 1) return;
    setOrderedTours((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const tourIds = orderedTours.map((tour) => tour.id);
      const updated = await tourService.reorderTours(stageId, { tourIds });
      toast.success(t('tours.validation.reorderSuccess'));
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      toast.error(backendMessage || t('tours.validation.loadError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className="font-semibold text-lg text-gray-900">
            {t('tours.modal.reorderTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className="text-xs text-gray-500 mb-3">
            {t('tours.modal.reorderDescription')}
          </p>

          <div className={styles.reorderList}>
            {orderedTours.map((tour, index) => (
              <div key={tour.id} className={styles.reorderItem}>
                <div className={styles.reorderItemInfo}>
                  <span className={styles.reorderIndexBadge}>{index + 1}</span>
                  <div>
                    <span className="font-medium text-sm text-gray-800 block">
                      {tour.title}
                    </span>
                    <span className="text-xs text-gray-400">{tour.location}</span>
                  </div>
                </div>

                <div className={styles.reorderActions}>
                  <button
                    type="button"
                    disabled={index === 0 || isSubmitting}
                    onClick={() => handleMoveUp(index)}
                    className={styles.reorderButton}
                    aria-label={t('tours.modal.moveUp')}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={index === orderedTours.length - 1 || isSubmitting}
                    onClick={() => handleMoveDown(index)}
                    className={styles.reorderButton}
                    aria-label={t('tours.modal.moveDown')}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {t('tours.modal.cancelButton')}
            </button>
            <button
              type="submit"
              onClick={handleSave}
              disabled={isSubmitting}
              className="btn-regular inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('tours.modal.saving')}</span>
                </>
              ) : (
                <span>{t('tours.modal.applyOrder')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourReorderModal;
