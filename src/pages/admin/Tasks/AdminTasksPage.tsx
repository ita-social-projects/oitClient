import AdminSearchInput from '@components/AdminSearchInput.tsx';
import Pagination from '@shared/components/Pagination';
import type {
  TaskDto,
  TaskResponse,
} from '@shared/models/task';
import { taskService } from '@shared/services/taskService';
import useAuth, { type AuthState } from '@shared/state/authState.tsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';


import ManageOwnersDialog from './ManageOwnersDialog';
import TaskCard from './TaskCard';


export default function AdminTasksPage() {
  const { t } = useTranslation('admin');

  const user = useAuth(
    (state: AuthState) => state.user,
  );

  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  const [selectedTask, setSelectedTask] =
    useState<TaskDto | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    let active = true;

    taskService
      .getTasks(page, 10, search)
      .then((data: TaskResponse) => {
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
      });

    return () => {
      active = false;
    };
  }, [user, page, search]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleTaskUpdated = (
    updatedTask: TaskDto,
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === updatedTask.id
          ? updatedTask
          : task,
      ),
    );

    setSelectedTask(updatedTask);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col mt-6">
      <h1 className="font-bold mb-2">
        {t('tasks.title')}
      </h1>

      <p className="text-sm text-meta mb-6">
        {t('tasks.subtitle')}
      </p>

      <div className="w-full mt-4 mb-6">
        <AdminSearchInput
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          placeholder={t('tasks.search')}
        />
      </div>

      {tasks.length === 0 && !error ? (
        <p className="text-center py-10">
          {t('tasks.empty')}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onManageOwners={() =>
                setSelectedTask(task)
              }
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-center py-10">
          {t('tasks.error')}
        </p>
      )}

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {selectedTask && (
        <ManageOwnersDialog
          task={selectedTask}
          open
          onClose={() =>
            setSelectedTask(null)
          }
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
