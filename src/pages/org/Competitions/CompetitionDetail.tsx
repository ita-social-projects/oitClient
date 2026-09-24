import { BackButton } from '@components/BackButton';
import type { CompetitionResponse } from '@shared/models/competition';
import { competitionService } from '@shared/services/competitionService.ts';
import DOMPurify from 'dompurify';
import {
  Calendar,
  Clock,
  FolderGit2,
  Info,
  Layers,
  Loader2,
  Pencil,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './Competitions.module.scss';
import CompetitionLifecycleStepper from './components/CompetitionLifecycleStepper';
import CompetitionStatusBadge from './components/CompetitionStatusBadge';

const formatFullDate = (isoStr?: string | null): string => {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
};

export const CompetitionDetail: React.FC = () => {
  const { t } = useTranslation('admin');
  const { id } = useParams<{ id: string }>();

  const [competition, setCompetition] = useState<CompetitionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await competitionService.getCompetitionById(Number(id));
        if (cancelled) return;
        setCompetition(data);
      } catch {
        if (cancelled) return;
        toast.error(t('competitionDetail.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const handleStatusChanged = (updated: CompetitionResponse) => {
    setCompetition(updated);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl">
        <div className="flex items-center gap-2 text-gray-500 mb-6">
          <Loader2 className="animate-spin" size={20} />
          <span>{t('competitionDetail.loading')}</span>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="p-6 max-w-5xl">
        <div className="mb-4">
          <BackButton
            text={t('competitionDetail.backToList')}
            to="/profile/competitions"
          />
        </div>
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">
            {t('competitionDetail.loadError')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4">
        <BackButton
          text={t('competitionDetail.backToList')}
          to="/profile/competitions"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold text-2xl text-gray-900">{competition.title}</h1>
            <CompetitionStatusBadge status={competition.competitionStatus} />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to={`/profile/competitions/${competition.id}/edit`}
            className="btn-regular inline-flex items-center gap-2"
          >
            <Pencil size={16} />
            <span>{t('competitionDetail.editButton')}</span>
          </Link>
        </div>
      </div>

      <CompetitionLifecycleStepper
        competitionId={competition.id}
        currentStatus={competition.competitionStatus}
        version={competition.version}
        onStatusChanged={handleStatusChanged}
      />

      <div className={styles.detailSection}>
        <h2 className={styles.sectionTitle}>
          <Calendar size={20} className="text-primary-100" />
          <span>{t('competitionDetail.datesTitle')}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">
                {t('competitionDetail.dateStart')}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatFullDate(competition.dateStart)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">
                {t('competitionDetail.dateFinish')}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatFullDate(competition.dateFinish)}
              </span>
            </div>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>
          <Info size={20} className="text-primary-100" />
          <span>{t('competitionDetail.descriptionTitle')}</span>
        </h2>

        {competition.description ? (
          <div
            className={styles.descriptionContent}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(competition.description),
            }}
          />
        ) : (
          <p className="text-sm text-gray-400 italic">
            {t('competitionDetail.noDescription')}
          </p>
        )}
      </div>

      <div className={styles.detailSection}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            <Layers size={20} className="text-primary-100" />
            <span>{t('competitionDetail.structureTitle')}</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {t('competitionDetail.structurePhase2Badge')}
          </span>
        </div>

        <div className={styles.phase2Card}>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary-100 flex items-center justify-center mx-auto mb-3">
            <FolderGit2 size={24} />
          </div>
          <h3 className="font-semibold text-base text-gray-800 mb-1">
            {t('competitionDetail.structureBuilderTitle')}
          </h3>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            {t('competitionDetail.structurePlaceholder')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetail;
