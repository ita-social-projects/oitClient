import type { StageStatus } from '@shared/models/stage';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Stages.module.scss';

interface StageStatusBadgeProps {
  readonly status: StageStatus;
}

const STATUS_STYLE_MAP: Record<StageStatus, string> = {
  SCHEDULED: styles.statusScheduled,
  IN_PROGRESS: styles.statusInProgress,
  FINISHED: styles.statusFinished,
  CANCELLED: styles.statusCancelled,
};

export const StageStatusBadge: React.FC<StageStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation('admin');
  const styleClass = STATUS_STYLE_MAP[status] || styles.statusScheduled;

  return (
    <span className={`${styles.statusBadge} ${styleClass}`}>
      {status === 'IN_PROGRESS' ? (
        <span className={styles.pulsingDot} />
      ) : (
        <span className={styles.statusDot} />
      )}
      <span>{t(`stages.status.${status}`)}</span>
    </span>
  );
};

export default StageStatusBadge;
