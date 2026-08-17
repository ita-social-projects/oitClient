import type { TaskDto } from '@shared/models/task';
import { useTranslation } from 'react-i18next';

interface TaskCardProps {
  task: TaskDto;
  onManageOwners: () => void;
}

export default function TaskCard({
  task,
  onManageOwners,
}: TaskCardProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex flex-col">
        <h2 className="font-semibold text-lg">
          {task.title}
        </h2>

        <p className="text-sm text-meta mt-2 line-clamp-3 max-w-3xl">
          {task.description}
        </p>

        <p className="text-sm text-meta mt-2 line-clamp-3">
          {t('tasks.creator')} {task.createdByEmail}
        </p>

        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={onManageOwners}
            className="btn-regular select-none"
          >
            {t('tasks.owners.manage')}
          </button>
        </div>
      </div>
    </div>
  );
}