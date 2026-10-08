import type { ExecutionStatus } from '@shared/models/tour';
import { CheckCircle2, Clock, Pause, Play, XCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Stages.module.scss';

interface TourExecutionStatusBadgeProps {
  readonly status: ExecutionStatus;
}

export const TourExecutionStatusBadge: React.FC<TourExecutionStatusBadgeProps> = ({
  status,
}) => {
  const { t } = useTranslation('admin');

  switch (status) {
    case 'SCHEDULED':
      return (
        <span className={`${styles.tourStatusBadge} ${styles.tourStatusScheduled}`}>
          <Clock size={11} />
          <span>{t('tours.status.SCHEDULED')}</span>
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span className={`${styles.tourStatusBadge} ${styles.tourStatusInProgress}`}>
          <span
            className={styles.tourPulseDot}
            data-testid="tour-pulse-dot"
            aria-hidden="true"
          />
          <Play size={10} className="fill-emerald-700" />
          <span>{t('tours.status.IN_PROGRESS')}</span>
        </span>
      );

    case 'CLOSED':
      return (
        <span className={`${styles.tourStatusBadge} ${styles.tourStatusClosed}`}>
          <Pause size={11} />
          <span>{t('tours.status.CLOSED')}</span>
        </span>
      );

    case 'FINISHED':
      return (
        <span className={`${styles.tourStatusBadge} ${styles.tourStatusFinished}`}>
          <CheckCircle2 size={11} />
          <span>{t('tours.status.FINISHED')}</span>
        </span>
      );

    case 'CANCELLED':
      return (
        <span className={`${styles.tourStatusBadge} ${styles.tourStatusCancelled}`}>
          <XCircle size={11} />
          <span>{t('tours.status.CANCELLED')}</span>
        </span>
      );

    default:
      return null;
  }
};

export default TourExecutionStatusBadge;
