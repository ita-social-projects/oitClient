import type { CompetitionStatus } from '@shared/models/competition';
import type { StageResponse } from '@shared/models/stage';
import type { ExecutionStatus, TourResponse } from '@shared/models/tour';
import { tourService } from '@shared/services/tourService';
import { ArrowUpDown, Loader2, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';


import TourCard from './TourCard';
import TourConfirmModal, {
  type TourConfirmActionType,
  type TourConfirmModalState,
} from './TourConfirmModal';
import TourFormModal from './TourFormModal';
import TourReorderModal from './TourReorderModal';

export interface StageToursSectionProps {
  readonly stage: StageResponse;
  readonly competitionStatus: CompetitionStatus;
  readonly isArchived: boolean;
  readonly onTourMutated?: () => void;
}

const NEXT_TOUR_STATUS: Record<Exclude<TourConfirmActionType, 'DELETE'>, ExecutionStatus> = {
  START: 'IN_PROGRESS',
  CLOSE: 'CLOSED',
  RESUME: 'IN_PROGRESS',
  FINISH: 'FINISHED',
  CANCEL: 'CANCELLED',
};

export const StageToursSection: React.FC<StageToursSectionProps> = ({
  stage,
  competitionStatus,
  isArchived,
  onTourMutated,
}) => {
  const { t } = useTranslation('admin');

  const [tours, setTours] = useState<TourResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourResponse | null>(null);

  const [confirmModal, setConfirmModal] = useState<TourConfirmModalState>({
    open: false,
    type: 'START',
    isLoading: false,
  });

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tourService.getToursByStage(stage.id);
      const sorted = [...data].sort((a, b) => a.sortPosition - b.sortPosition);
      setTours(sorted);
    } catch {
      toast.error(t('tours.validation.loadError'));
    } finally {
      setLoading(false);
    }
  }, [stage.id, t]);

  useEffect(() => {
    void fetchTours();
  }, [fetchTours]);

  const canReorder =
    tours.length > 1 && tours.every((tour) => tour.executionStatus === 'SCHEDULED');

  const handleOpenCreate = () => {
    setSelectedTour(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (tour: TourResponse) => {
    setSelectedTour(tour);
    setFormModalOpen(true);
  };

  const handleStatusChangeAction = (tour: TourResponse, action: TourConfirmActionType) => {
    setSelectedTour(tour);
    setConfirmModal({
      open: true,
      type: action,
      isLoading: false,
    });
  };

  const handleConfirmAction = async (extendedFinishDate?: string) => {
    if (!selectedTour) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));

    try {
      if (confirmModal.type === 'DELETE') {
        await tourService.deleteTour(stage.id, selectedTour.id);
        toast.success(t('tours.validation.deleteSuccess'));
      } else {
        // If resuming with extended finish date, update date first
        if (confirmModal.type === 'RESUME' && extendedFinishDate) {
          await tourService.updateTour(stage.id, selectedTour.id, {
            title: selectedTour.title,
            description: selectedTour.description,
            dateStart: selectedTour.dateStart,
            dateFinish: extendedFinishDate,
            location: selectedTour.location,
            sortPosition: selectedTour.sortPosition,
            version: selectedTour.version,
          });
        }

        const nextStatus = NEXT_TOUR_STATUS[confirmModal.type];
        await tourService.changeTourStatus(stage.id, selectedTour.id, {
          status: nextStatus,
          version: selectedTour.version,
        });
        toast.success(t('tours.validation.statusChangeSuccess'));
      }

      setConfirmModal({ open: false, type: 'START', isLoading: false });
      await fetchTours();
      onTourMutated?.();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(t('tours.validation.conflictError'));
        await fetchTours();
      } else {
        const backendMessage = err?.response?.data?.message;
        toast.error(backendMessage || t('tours.validation.loadError'));
      }
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {t('tours.title')}
          </span>
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {tours.length}
          </span>
        </div>

        {!isArchived && (
          <div className="flex items-center gap-2">
            {tours.length > 1 && (
              <button
                type="button"
                disabled={!canReorder}
                onClick={() => setReorderModalOpen(true)}
                className={`text-xs inline-flex items-center gap-1 font-medium cursor-pointer ${
                  canReorder
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 opacity-50 cursor-not-allowed'
                }`}
                title={!canReorder ? t('tours.preconditions.cannotReorderStarted') : ''}
              >
                <ArrowUpDown size={13} />
                <span>{t('tours.reorderTours')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreate}
              className="text-xs text-primary-100 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
            >
              <Plus size={13} />
              <span>{t('tours.addTour')}</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-xs">{t('tours.loading')}</span>
        </div>
      ) : tours.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {tours.map((tour, index) => {
            const previousTour = index > 0 ? tours[index - 1] : null;
            const previousTourFinished =
              !previousTour || previousTour.executionStatus === 'FINISHED';

            return (
              <TourCard
                key={tour.id}
                tour={tour}
                stageStatus={stage.status}
                competitionStatus={competitionStatus}
                isArchived={isArchived}
                previousTourFinished={previousTourFinished}
                onEdit={handleOpenEdit}
                onDelete={(t) => handleStatusChangeAction(t, 'DELETE')}
                onStatusChange={handleStatusChangeAction}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-xs text-gray-400">{t('tours.noTours')}</p>
        </div>
      )}

      {/* Form Modal */}
      {formModalOpen && (
        <TourFormModal
          open={formModalOpen}
          stageId={stage.id}
          stageDates={{
            dateStart: stage.dateStart,
            dateFinish: stage.dateFinish,
          }}
          initialTour={selectedTour}
          existingTours={tours}
          onClose={() => setFormModalOpen(false)}
          onSuccess={() => {
            void fetchTours();
            onTourMutated?.();
          }}
        />
      )}

      {/* Reorder Modal */}
      {reorderModalOpen && (
        <TourReorderModal
          open={reorderModalOpen}
          stageId={stage.id}
          tours={tours}
          onClose={() => setReorderModalOpen(false)}
          onSuccess={() => {
            void fetchTours();
            onTourMutated?.();
          }}
        />
      )}

      {/* Confirmation Modal */}
      <TourConfirmModal
        modalState={confirmModal}
        tour={selectedTour}
        onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default StageToursSection;
