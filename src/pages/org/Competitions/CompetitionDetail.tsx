import { BackButton } from '@components/BackButton';
import type { CompetitionResponse } from '@shared/models/competition';
import type { StageTreeNode } from '@shared/models/stage';
import { competitionService } from '@shared/services/competitionService.ts';
import { stageService } from '@shared/services/stageService';
import DOMPurify from 'dompurify';
import {
  Calendar,
  Clock,
  Info,
  Loader2,
  Pencil,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './Competitions.module.scss';
import CompetitionLifecycleStepper from './components/CompetitionLifecycleStepper';
import CompetitionStagesSection from './components/CompetitionStagesSection';
import CompetitionStatusBadge from './components/CompetitionStatusBadge';

const formatFullDate = (isoStr?: string | null, locale = 'uk-UA'): string => {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(locale, {
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
  const { t, i18n } = useTranslation('admin');
  const { id } = useParams<{ id: string }>();

  const [competition, setCompetition] = useState<CompetitionResponse | null>(null);
  const [stagesNodes, setStagesNodes] = useState<StageTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  const requestIdRef = useRef(0);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!id) return;
    const currentRequestId = ++requestIdRef.current;
    if (!isRefresh) setLoading(true);

    try {
      const [compResult, treeResult] = await Promise.allSettled([
        competitionService.getCompetitionById(Number(id)),
        stageService.getCompetitionTree(Number(id)),
      ]);

      if (currentRequestId !== requestIdRef.current) return;

      if (compResult.status === 'fulfilled') {
        setCompetition(compResult.value);
      } else {
        setCompetition(null);
        toast.error(t('competitionDetail.loadError'));
      }

      if (treeResult.status === 'fulfilled') {
        const sorted = [...(treeResult.value.stages || [])].sort(
          (a, b) => a.stage.sortPosition - b.stage.sortPosition
        );
        setStagesNodes(sorted);
      } else {
        setStagesNodes([]);
        toast.error(t('stages.validation.loadError'));
      }
    } catch {
      if (currentRequestId === requestIdRef.current) {
        toast.error(t('competitionDetail.loadError'));
      }
    } finally {
      if (currentRequestId === requestIdRef.current && !isRefresh) {
        setLoading(false);
      }
    }
  }, [id, t]);

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

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
    <div className="p-6 max-w-5xl w-full min-w-0">
      <div className="mb-4">
        <BackButton
          text={t('competitionDetail.backToList')}
          to={competition?.competitionStatus === 'ARCHIVED' ? '/profile/competitions/archive' : '/profile/competitions'}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold text-2xl text-gray-900 break-words">{competition.title}</h1>
            <CompetitionStatusBadge status={competition.competitionStatus} />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {competition.competitionStatus !== 'ARCHIVED' && (
            <Link
              to={`/profile/competitions/${competition.id}/edit`}
              className="btn-regular inline-flex items-center gap-2"
            >
              <Pencil size={16} />
              <span>{t('competitionDetail.editButton')}</span>
            </Link>
          )}
        </div>
      </div>

      <CompetitionLifecycleStepper
        competitionId={competition.id}
        currentStatus={competition.competitionStatus}
        version={competition.version}
        stages={stagesNodes}
        onStatusChanged={handleStatusChanged}
        onRefresh={() => loadData(true)}
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
                {formatFullDate(competition.dateStart, i18n.language)}
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
                {formatFullDate(competition.dateFinish, i18n.language)}
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

      <CompetitionStagesSection
        competition={competition}
        onRefresh={() => loadData(true)}
      />
    </div>
  );
};

export default CompetitionDetail;
