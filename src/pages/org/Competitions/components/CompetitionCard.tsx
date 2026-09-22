import type { CompetitionResponse } from '@shared/models/competition';
import DOMPurify from 'dompurify';
import { Calendar, Eye, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from '../Competitions.module.scss';
import CompetitionStatusBadge from './CompetitionStatusBadge';

interface CompetitionCardProps {
  readonly competition: CompetitionResponse;
}

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const CompetitionCard = ({ competition }: CompetitionCardProps) => {
  const { t } = useTranslation('admin');

  return (
    <div className={styles.competitionCard}>
      <div>
        <div className={styles.cardHeader}>
          <CompetitionStatusBadge status={competition.competitionStatus} />
          <div className={styles.dateRange}>
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span>
              {formatDate(competition.dateStart)} – {formatDate(competition.dateFinish)}
            </span>
          </div>
        </div>

        <Link
          to={`/profile/competitions/${competition.id}`}
          className={styles.competitionTitle}
        >
          {competition.title}
        </Link>

        {competition.description && (
          <div
            className={styles.competitionDescription}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(competition.description),
            }}
          />
        )}
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.metaInfo}>
          ID: #{competition.id}
        </div>

        <div className={styles.actions}>
          <Link
            to={`/profile/competitions/${competition.id}/edit`}
            className={styles.btnEdit}
            title={t('competitions.edit')}
          >
            <Pencil size={15} />
            <span>{t('competitions.edit')}</span>
          </Link>

          <Link
            to={`/profile/competitions/${competition.id}`}
            className={styles.btnManage}
            title={t('competitions.manage')}
          >
            <Eye size={15} />
            <span>{t('competitions.manage')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompetitionCard;
