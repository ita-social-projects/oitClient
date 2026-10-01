import type { CompetitionResponse } from '@shared/models/competition';
import type { StageResponse, StageTreeNode } from '@shared/models/stage';
import { stageService } from '@shared/services/stageService';
import { Layers, Loader2, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import StageCard from './StageCard';
import StageFormModal from './StageFormModal';
import styles from './Stages.module.scss';

interface CompetitionStagesSectionProps {
  readonly competition: CompetitionResponse;
}

export const CompetitionStagesSection: React.FC<CompetitionStagesSectionProps> = ({
  competition,
}) => {
  const { t } = useTranslation('admin');
  const [stagesNodes, setStagesNodes] = useState<StageTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<StageResponse | null>(null);

  const isArchived = competition.competitionStatus === 'ARCHIVED';

  const existingStages = React.useMemo(
    () => stagesNodes.map((n) => n.stage),
    [stagesNodes]
  );

  const competitionDates = React.useMemo(
    () => ({
      dateStart: competition.dateStart,
      dateFinish: competition.dateFinish,
    }),
    [competition.dateStart, competition.dateFinish]
  );

  const fetchTree = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await stageService.getCompetitionTree(competition.id);
      // Sort stages by sortPosition ascending
      const sorted = [...(data.stages || [])].sort(
        (a, b) => a.stage.sortPosition - b.stage.sortPosition
      );
      setStagesNodes(sorted);
    } catch {
      toast.error(t('stages.validation.loadError'));
    } finally {
      setLoading(false);
    }
  }, [competition.id, t]);

  useEffect(() => {
    void fetchTree();
  }, [fetchTree]);

  const handleOpenCreate = () => {
    setSelectedStage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (stage: StageResponse) => {
    setSelectedStage(stage);
    setModalOpen(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8 text-gray-500 gap-2">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">{t('competitionDetail.loading')}</span>
        </div>
      );
    }

    if (stagesNodes.length === 0) {
      return (
        <div className={styles.emptyContainer}>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary-100 flex items-center justify-center mx-auto mb-3">
            <Layers size={22} />
          </div>
          <h3 className="font-semibold text-sm text-gray-800 mb-1">
            {t('stages.noStagesTitle')}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-4 leading-relaxed">
            {t('stages.noStagesDescription')}
          </p>
          {!isArchived && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="btn-regular inline-flex items-center gap-1.5 text-xs py-1.5 px-3 cursor-pointer"
            >
              <Plus size={14} />
              <span>{t('stages.addStage')}</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {stagesNodes.map((node, index) => {
          const previousNode = index > 0 ? stagesNodes[index - 1] : null;
          const previousStageFinished =
            !previousNode || previousNode.stage.status === 'FINISHED';

          return (
            <StageCard
              key={node.stage.id}
              node={node}
              competitionStatus={competition.competitionStatus}
              isArchived={isArchived}
              previousStageFinished={previousStageFinished}
              onEdit={handleOpenEdit}
              onDelete={fetchTree}
              onStatusChanged={fetchTree}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className="flex items-center gap-2.5">
          <Layers size={20} className="text-primary-100" />
          <h2 className="font-semibold text-lg text-gray-900">{t('stages.title')}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {stagesNodes.length}
          </span>
        </div>

        {!isArchived && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn-regular inline-flex items-center gap-1.5 text-xs py-1.5 px-3 cursor-pointer"
          >
            <Plus size={15} />
            <span>{t('stages.addStage')}</span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-4">{t('stages.subtitle')}</p>

      {renderContent()}

      {modalOpen && (
        <StageFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchTree}
          onConflict={fetchTree}
          competitionId={competition.id}
          competitionDates={competitionDates}
          initialStage={selectedStage}
          existingStages={existingStages}
        />
      )}
    </div>
  );
};

export default CompetitionStagesSection;
