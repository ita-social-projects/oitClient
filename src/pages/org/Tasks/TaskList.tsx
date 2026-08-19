import SimplePagination from '@components/SimplePagination.tsx';
import { taskService } from '@services/taskService.ts';
import type { TaskDTO } from '@shared/models/task.ts';
import { FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import TaskRow from './TaskRow.tsx';
import styles from './Tasks.module.scss';

export default function TaskList() {
  const { t } = useTranslation('admin');
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const res = await taskService.getMyTasks(page, 4);
        if (signal?.aborted) return;

        setTasks(Array.isArray(res.content) ? res.content : []);
        setTotalPages(res.totalPages);
      } catch {
        if (signal?.aborted) return;
        setTasks([]);
        setTotalPages(0);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadTasks(controller.signal);
    return () => controller.abort();
  }, [loadTasks]);

  const handleDeleted = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const renderContent = () => {
    if (loading) {
      return <p>{t('tasks.loading')}</p>;
    }

    if (tasks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FileText size={28} color="#9ca3af" />
          <p className="font-medium">{t('tasks.noTasks')}</p>
        </div>
      );
    }

    return (
      <ul className="flex flex-col gap-3" style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <TaskRow key={task.id} task={task} onDeleted={handleDeleted} />
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl">{t('tasks.title')}</h1>
        <Link to="/profile/tasks/create" className="btn-regular">
          <i className="fa-solid fa-plus mr-2" />
          {t('tasks.createButton')}
        </Link>
      </div>

      {renderContent()}

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
