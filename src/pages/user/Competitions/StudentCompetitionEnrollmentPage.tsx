import { ConfirmModal } from '@components/ConfirmModal';
import Input from '@components/Input';
import type { OpenCompetitionEnrollment } from '@shared/models/enrollment';
import { enrollmentService } from '@shared/services/enrollmentService';
import { AlertCircle, Search, Trophy, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { StudentCompetitionCard } from './components/StudentCompetitionCard';
import { StudentCompetitionEmptyState } from './components/StudentCompetitionEmptyState';

export const StudentCompetitionEnrollmentPage: React.FC = () => {
  const { t } = useTranslation(['profile', 'common']);

  const [competitions, setCompetitions] = useState<OpenCompetitionEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [applyTarget, setApplyTarget] = useState<OpenCompetitionEnrollment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OpenCompetitionEnrollment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrollmentService.getOpenCompetitions();
      setCompetitions(Array.isArray(data) ? data : []);
    } catch {
      setError(t('studentEnrollment.toast.errorDefault'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const filteredCompetitions = useMemo(() => {
    const list = competitions || [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase().trim();
    return list.filter((comp) =>
      comp.competition.title.toLowerCase().includes(term)
    );
  }, [competitions, searchTerm]);

  const handleConfirmApply = async () => {
    if (!applyTarget) return;
    setIsSubmitting(true);
    try {
      const res = await enrollmentService.applyToCompetition(
        applyTarget.competition.id,
        applyTarget.stage.id
      );
      toast.success(t('studentEnrollment.toast.applySuccess'));

      setCompetitions((prev) =>
        prev.map((c) =>
          c.competition.id === applyTarget.competition.id &&
          c.stage.id === applyTarget.stage.id
            ? {
                ...c,
                userApplication: {
                  id: res.id,
                  status: res.status,
                },
              }
            : c
        )
      );
      setApplyTarget(null);
    } catch {
      toast.error(t('studentEnrollment.toast.errorDefault'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget?.userApplication) return;
    setIsSubmitting(true);
    try {
      await enrollmentService.cancelUserApplication(cancelTarget.userApplication.id);
      toast.success(t('studentEnrollment.toast.cancelSuccess'));

      setCompetitions((prev) =>
        prev.map((c) =>
          c.competition.id === cancelTarget.competition.id &&
          c.stage.id === cancelTarget.stage.id
            ? {
                ...c,
                userApplication: {
                  ...c.userApplication!,
                  status: 'CANCELLED',
                },
              }
            : c
        )
      );
      setCancelTarget(null);
    } catch {
      toast.error(t('studentEnrollment.toast.errorDefault'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t('studentEnrollment.title')}
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t('studentEnrollment.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('studentEnrollment.searchPlaceholder')}
          aria-label={t('studentEnrollment.searchPlaceholder')}
          icon={<Search size={18} />}
          iconEnd={
            searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition flex items-center justify-center"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : undefined
          }
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={fetchCompetitions}
            className="ml-auto text-xs underline font-medium hover:text-red-900 cursor-pointer"
          >
            {t('studentEnrollment.retry', {
              defaultValue: t('general.retry', {
                ns: 'common',
                defaultValue: 'Спробувати ще раз',
              }),
            })}
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="border border-gray-200 rounded-xl p-5 bg-white animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-3 flex-1">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  <div className="h-5 w-24 bg-gray-200 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
              <div className="h-9 w-32 bg-gray-200 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {(competitions || []).length === 0 ? (
            <StudentCompetitionEmptyState isSearch={false} />
          ) : filteredCompetitions.length === 0 ? (
            <StudentCompetitionEmptyState
              isSearch={true}
              onResetSearch={() => setSearchTerm('')}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {filteredCompetitions.map((comp) => (
                <StudentCompetitionCard
                  key={`${comp.competition.id}-${comp.stage.id}`}
                  competition={comp}
                  onApply={(target) => setApplyTarget(target)}
                  onCancel={(target) => setCancelTarget(target)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Apply Modal */}
      {applyTarget && (
        <ConfirmModal
          open={Boolean(applyTarget)}
          onClose={() => !isSubmitting && setApplyTarget(null)}
          title={t('studentEnrollment.modal.applyTitle')}
          message={t('studentEnrollment.modal.applyMessage', {
            title: applyTarget.competition.title,
            stageTitle: applyTarget.stage.title,
          })}
          confirmText={t('studentEnrollment.modal.applyConfirm')}
          isLoading={isSubmitting}
          onConfirm={handleConfirmApply}
        />
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <ConfirmModal
          open={Boolean(cancelTarget)}
          onClose={() => !isSubmitting && setCancelTarget(null)}
          title={t('studentEnrollment.modal.cancelTitle')}
          message={t('studentEnrollment.modal.cancelMessage', {
            title: cancelTarget.competition.title,
          })}
          confirmText={t('studentEnrollment.modal.cancelConfirm')}
          isLoading={isSubmitting}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
};

export default StudentCompetitionEnrollmentPage;
