import type { StageTourItem } from '@shared/models/stage';
import { MapPin, Plus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import styles from './Stages.module.scss';

export interface StageToursSectionProps {
  readonly tours: StageTourItem[];
  readonly isArchived: boolean;
}

export const StageToursSection: React.FC<StageToursSectionProps> = ({
  tours,
  isArchived,
}) => {
  const { t } = useTranslation('admin');

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {t('stages.tours.title')}
        </span>
        {!isArchived && (
          <button
            type="button"
            onClick={() => toast.info(t('stages.actions.addTourPlaceholder'))}
            className="text-xs text-primary-100 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
          >
            <Plus size={13} />
            <span>{t('stages.actions.addTour')}</span>
          </button>
        )}
      </div>

      {tours.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tours.map((tour) => (
            <div key={tour.id} className={styles.tourMiniCard}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {tour.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                  {tour.executionStatus}
                </span>
              </div>
              {tour.location && (
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{tour.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-xs text-gray-400">{t('stages.tours.noTours')}</p>
        </div>
      )}
    </div>
  );
};

export default StageToursSection;
