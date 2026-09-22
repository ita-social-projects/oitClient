import { BackButton } from '@components/BackButton';
import Editor from '@components/Editor';
import Input from '@components/Input';
import { competitionService } from '@shared/services/competitionService.ts';
import DOMPurify from 'dompurify';
import { Calendar, Loader2, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './Competitions.module.scss';

const toLocalDatetimeInputValue = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

export const CompetitionForm: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateFinish, setDateFinish] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState(0);

  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadCompetition = async () => {
      setLoading(true);
      try {
        const comp = await competitionService.getCompetitionById(Number(id));
        if (cancelled) return;
        setTitle(comp.title);
        setDateStart(toLocalDatetimeInputValue(comp.dateStart));
        setDateFinish(toLocalDatetimeInputValue(comp.dateFinish));
        setDescription(comp.description || '');
        setVersion(comp.version);
      } catch {
        if (cancelled) return;
        toast.error(t('competitionForm.loadError'));
        navigate('/profile/competitions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCompetition();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, t]);

  const validateDates = (start: string, finish: string): boolean => {
    if (!start || !finish) return true;
    if (new Date(finish) <= new Date(start)) {
      setDateError(
        t('competitionForm.dateFinishAfterStart')
      );
      return false;
    }
    setDateError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    const trimmedTitle = title.trim();

    if (!trimmedTitle || trimmedTitle.length < 3) {
      setTitleError(t('competitionForm.titleMinLength'));
      valid = false;
    } else if (trimmedTitle.length > 255) {
      setTitleError(t('competitionForm.titleMaxLength'));
      valid = false;
    } else {
      setTitleError(null);
    }

    if (!dateStart || !dateFinish) {
      setDateError(t('competitionForm.datesRequired'));
      valid = false;
    } else if (!validateDates(dateStart, dateFinish)) {
      valid = false;
    }

    if (!valid) return;

    setIsSubmitting(true);
    try {
      const sanitizedDescription = description.trim() ? DOMPurify.sanitize(description.trim()) : null;
      const isoStart = new Date(dateStart).toISOString();
      const isoFinish = new Date(dateFinish).toISOString();

      if (isEditMode) {
        await competitionService.updateCompetition(Number(id), {
          title: trimmedTitle,
          description: sanitizedDescription,
          dateStart: isoStart,
          dateFinish: isoFinish,
          version,
        });
        toast.success(t('competitionForm.updatedSuccess'));
      } else {
        await competitionService.createCompetition({
          title: trimmedTitle,
          description: sanitizedDescription,
          dateStart: isoStart,
          dateFinish: isoFinish,
        });
        toast.success(t('competitionForm.createdSuccess'));
      }

      navigate('/profile/competitions');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(t('competitionForm.conflictError'));
      } else {
        toast.error(t('competitionForm.submitError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl">
        <div className="flex items-center gap-2 text-gray-500 mb-6">
          <Loader2 className="animate-spin" size={20} />
          <span>{t('competitions.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-4">
        <BackButton text={t('competitionForm.backToList')} to="/profile/competitions" />
      </div>

      <div className="mb-6">
        <h1 className="font-bold text-2xl text-gray-900">
          {isEditMode
            ? t('competitionForm.editTitle')
            : t('competitionForm.createTitle')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditMode
            ? t('competitionForm.editSubtitle') : t('competitionForm.createSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* Title */}
        <div className={styles.fieldGroup}>
          <label htmlFor="competition-title" className={styles.fieldLabel}>
            {t('competitionForm.titleLabel')}
            <span className={styles.requiredAsterisk}>*</span>
          </label>
          <Input
            id="competition-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(null);
            }}
            placeholder={t('competitionForm.titlePlaceholder')}
            invalid={Boolean(titleError)}
            required
            maxLength={255}
          />
          {titleError && <span className={styles.fieldError}>{titleError}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="competition-date-start" className={styles.fieldLabel}>
              <span className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                <span>{t('competitionForm.dateStartLabel')}</span>
                <span className={styles.requiredAsterisk}>*</span>
              </span>
            </label>
            <Input
              id="competition-date-start"
              type="datetime-local"
              value={dateStart}
              onChange={(e) => {
                setDateStart(e.target.value);
                validateDates(e.target.value, dateFinish);
              }}
              invalid={Boolean(dateError)}
              required
            />
          </div>

          <div>
            <label htmlFor="competition-date-finish" className={styles.fieldLabel}>
              <span className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                <span>{t('competitionForm.dateFinishLabel')}</span>
                <span className={styles.requiredAsterisk}>*</span>
              </span>
            </label>
            <Input
              id="competition-date-finish"
              type="datetime-local"
              value={dateFinish}
              onChange={(e) => {
                setDateFinish(e.target.value);
                validateDates(dateStart, e.target.value);
              }}
              invalid={Boolean(dateError)}
              required
            />
          </div>
        </div>

        {dateError && (
          <div className="mb-5">
            <span className={styles.fieldError}>{dateError}</span>
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t('competitionForm.descriptionLabel')}
          </label>
          <div className={styles.editorWrapper}>
            <Editor value={description} onChange={setDescription} />
          </div>
        </div>

        <div className={styles.formActions}>
          <Link
            to="/profile/competitions"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {t('competitionForm.cancelButton')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-regular inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t('competitionForm.submitting')}</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>
                  {isEditMode
                    ? t('competitionForm.saveButton')
                    : t('competitionForm.createButton')}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompetitionForm;
