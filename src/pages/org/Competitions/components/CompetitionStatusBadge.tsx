import type { CompetitionStatus } from '@shared/models/competition';
import { useTranslation } from 'react-i18next';

import styles from '../Competitions.module.scss';

interface CompetitionStatusBadgeProps {
  status: CompetitionStatus;
  className?: string;
}

const STATUS_CLASS_MAP: Record<CompetitionStatus, string> = {
  DRAFT: styles.badgeDraft,
  ENROLLMENT: styles.badgeEnrollment,
  PUBLISHED: styles.badgePublished,
  FINISHED: styles.badgeFinished,
  ARCHIVED: styles.badgeArchived,
};

export const CompetitionStatusBadge = ({ status, className = '' }: CompetitionStatusBadgeProps) => {
  const { t } = useTranslation('admin');
  const label = t(`competitionStatus.${status}`);
  const variantClass = STATUS_CLASS_MAP[status] || styles.badgeDraft;

  return (
    <span className={`${styles.badge} ${variantClass} ${className}`}>
      <span className={styles.badgeDot} />
      {label}
    </span>
  );
};

export default CompetitionStatusBadge;
