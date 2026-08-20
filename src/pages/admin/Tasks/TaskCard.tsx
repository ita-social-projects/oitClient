import type { TaskDTO } from '@shared/models/task';
import { useTranslation } from 'react-i18next';

interface TaskCardProps {
  readonly task: TaskDTO;
  readonly onManageOwners: () => void;
}

export default function TaskCard({
  task,
  onManageOwners,
}: TaskCardProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-5">
      <div className="min-w-0">
        <h2 className="font-semibold text-base sm:text-lg break-words">{task.title}</h2>

        <p className="text-sm text-meta mt-2 line-clamp-3 w-full max-w-3xl">{task.description}</p>

        <p className="text-sm text-meta mt-2 break-all">
          {t('manage-tasks.creator')} {task.createdByEmail}
        </p>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onManageOwners}
            className="btn-regular select-none w-full sm:w-auto"
          >
            {t('manage-tasks.owners.manage')}
          </button>
        </div>
      </div>
    </div>
  );
}