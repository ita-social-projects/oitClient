import { useParams, useNavigate } from 'react-router-dom';
import TaskList from './TaskList';
import { ARCHIVED_OLYMPIADS, OLYMPIAD_TASKS } from '../ComponentArchive.constants.ts';
import { useTranslation } from 'react-i18next';

export function CompetitionArchiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('competition');

  const olympiad = ARCHIVED_OLYMPIADS.find(o => o.id === Number(id));
  const tasks = OLYMPIAD_TASKS[Number(id)] ?? [];

  if (!olympiad) {
    return (
      <div className="p-8">
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-10 text-center">
          <h2 className="text-[var(--color-text)] mb-4">{t('archive.notFound')}</h2>

          <button
            onClick={() => navigate('/competitions/archive')}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg"
          >
            {t('archive.back')}
          </button>
        </div>
      </div>
    );
  }

  return <TaskList olympiadName={olympiad.name} tasks={tasks} onBack={() => navigate(-1)} />;
}
