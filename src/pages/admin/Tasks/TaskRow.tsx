import type { TaskItem } from '@shared/models/task';
import { Eye, FileText, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import TaskDeleteModal from './TaskDeleteModal.tsx';
import styles from './Tasks.module.scss';

type TaskRowProps = {
  readonly task: TaskItem;
  readonly onDeleted: (id: number) => void;
};

export default function TaskRow({ task, onDeleted }: TaskRowProps) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <li className={styles.taskCard} style={{ cursor: 'default' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={styles.taskTitle}>
              <FileText size={16} className="shrink-0 text-primary-100" />
              {task.title}
            </h3>
            {task.description && <p className={styles.taskDescription}>{task.description}</p>}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.edit}
              title="View"
              onClick={() => navigate(`/profile/tasks/${task.id}`)}
            >
              <Eye size={18} />
            </button>
            <button
              type="button"
              className={styles.edit}
              title={t('task-detail.editButton')}
              onClick={() => navigate(`/profile/tasks/edit/${task.id}`)}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              className={styles.delete}
              title={t('task-detail.deleteButton')}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className={styles.taskMeta}>
          <span className={styles.fileBadge}>
            <FileText size={12} />
            {t('tasks.fileCount', { count: task.files.length })}
          </span>
        </div>
      </li>

      <TaskDeleteModal
        taskId={task.id}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => onDeleted(task.id)}
      />
    </>
  );
}
