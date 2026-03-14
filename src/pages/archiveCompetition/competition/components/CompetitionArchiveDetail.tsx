import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TaskList from './TaskList';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import type { Task } from '@shared/models/CompetitionArchive.types.ts';
import { getTasks } from '@services/competitionService.ts';

export function CompetitionArchiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('competition');
  const [tasks, setTasks] = useState<Task[]>([]);

  const olympiadName = location.state?.name ?? 'Competition';

  useEffect(() => {
    if (id) {
      getTasks(Number(id)).then(setTasks);
    }
  }, [id]);

  if (!id) {
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

  return <TaskList
    olympiadName={olympiadName}
    tasks={tasks}
    onBack={() => navigate(-1)} />;
}
