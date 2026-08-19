import AdminSearchInput from '@components/AdminSearchInput.tsx';
import Pagination from '@shared/components/Pagination';
import type { TaskDTO, TaskListResponse } from '@shared/models/task';
import { taskService } from '@shared/services/taskService';
import useAuth, { type AuthState } from '@shared/state/authState.tsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import ManageOwnersDialog from './ManageOwnersDialog';
import TaskCard from './TaskCard';

export default function AdminTasksPage() {
  const { t } = useTranslation('admin');

  const user = useAuth((state: AuthState) => state.user);

  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    let active = true;

    const loadTasks = () => {
      setLoading(true);

      taskService
        .getTasks(page, 10, debouncedSearch)
        .then((data: TaskListResponse) => {
          if (!active) {
            return;
          }

          setTasks(data.content);
          setTotalPages(data.totalPages);
          setError(false);
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setTasks([]);
          setTotalPages(0);
          setError(true);
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    };

    loadTasks();

    return () => {
      active = false;
    };
  }, [user, page, debouncedSearch]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleTaskUpdated = (updatedTask: TaskDTO) => {
    setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));

    setSelectedTask(updatedTask);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col mt-6 px-4 sm:px-6">
      <h1 className="font-bold mb-2 text-xl sm:text-2xl">{t('menage-tasks.title')}</h1>

      <p className="text-sm text-meta mb-6">{t('menage-tasks.subtitle')}</p>

      <div className="w-full mt-2 sm:mt-4 mb-6">
        <AdminSearchInput
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          placeholder={t('menage-tasks.search')}
        />
      </div>

      {tasks.length === 0 && loading && (
        <p className="text-center py-10">{t('manage-tasks.loading')}</p>
      )}

      {tasks.length === 0 && !error ? (
        <p className="text-center py-10">{t('menage-tasks.empty')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onManageOwners={() => setSelectedTask(task)} />
          ))}
        </div>
      )}

      {error && <p className="text-center py-10">{t('menage-tasks.error')}</p>}

      <div className="mt-8 pb-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {selectedTask && (
        <ManageOwnersDialog
          task={selectedTask}
          open
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
