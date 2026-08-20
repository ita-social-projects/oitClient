import { BackButton } from '@components/BackButton.tsx';
import { taskService } from '@services/taskService.ts';
import { axiosInstance } from '@shared/api/axiosInstance.ts';
import type { FileDetailsDTO, TaskDTO } from '@shared/models/task.ts';
import { formatFileSize } from '@utils/taskUtils.ts';
import { Eye, EyeOff, FileText, FileLock, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import TaskDeleteModal from './TaskDeleteModal.tsx';
import styles from './Tasks.module.scss';

const filesByRole = (files: FileDetailsDTO[], role: string) =>
  files.filter((f) => f.fileRole === role);

const downloadFile = async (file: FileDetailsDTO) => {
  const response = await axiosInstance.get(file.url, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.originalFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function TaskDetail() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadTask = async () => {
      setLoading(true);
      try {
        const data = await taskService.getTaskById(Number(id));
        if (cancelled) return;
        setTask(data);
      } catch {
        if (cancelled) return;
        toast.error(t('task-detail.notFound'));
        navigate('/profile/tasks');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadTask();

    return () => { cancelled = true; };
  }, [id, navigate, t]);

  if (loading) {
    return (
      <div className="p-6">
        <p>{t('task-detail.loading')}</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <p>{t('task-detail.notFound')}</p>
      </div>
    );
  }

  const problemFiles = filesByRole(task.files, 'PROBLEM');
  const referenceFiles = filesByRole(task.files, 'REFERENCE');
  const solutionFiles = filesByRole(task.files, 'SOLUTION');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackButton text={t('task-detail.back')} to="/profile/tasks" />

      <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{task.title}</h1>
          {task.description && <p className="mt-2 text-sm text-gray-600">{task.description}</p>}
          <div className="flex gap-2 mt-3">
            <span className={styles.infoBadge}>
              {t('task-detail.createdBy')} {task.createdByEmail}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => navigate(`/profile/tasks/edit/${task.id}`)}
          >
            <Pencil size={16} style={{ marginRight: 6 }} />
            {t('task-detail.editButton')}
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={16} style={{ marginRight: 6 }} />
            {t('task-detail.deleteButton')}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FileGroupCard title={t('task-detail.problemFiles')} files={problemFiles} visible />
          <FileGroupCard title={t('task-detail.referenceFiles')} files={referenceFiles} visible />
        </div>
        <FileGroupCard
          title={t('task-detail.solutionFiles')}
          files={solutionFiles}
          visible={false}
        />
      </div>

      <TaskDeleteModal
        taskId={task.id}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => navigate('/profile/tasks')}
      />
    </div>
  );
}

function FileGroupCard({
  title,
  files,
  visible,
}: Readonly<{
  title: string;
  files: FileDetailsDTO[];
  visible: boolean;
}>) {
  const { t } = useTranslation('admin');

  return (
    <section className={styles.fileGroup}>
      <h3 className={styles.fileGroupTitle}>
        {visible ? (
          <FileText size={16} className="text-primary-100" />
        ) : (
          <FileLock size={16} className="text-gray-400" />
        )}
        {title}
        <span className={visible ? styles.visibleBadge : styles.hiddenBadge}>
          {visible ? (
            <>
              <Eye size={12} />
              {t('task-detail.participantVisible')}
            </>
          ) : (
            <>
              <EyeOff size={12} />
              {t('task-detail.hidden')}
            </>
          )}
        </span>
      </h3>

      {files.length === 0 ? (
        <p className="text-sm text-gray-400">{t('task-detail.noFiles')}</p>
      ) : (
        <div>
          {files.map(file => (
            <button
              type='button'
              key={file.id}
              className={styles.fileRow}
              onClick={() => downloadFile(file).catch(()=>toast.error(t('task-detail.downloadFailed')))}
              title={file.originalFilename}
            >
              <span className={styles.fileName}>{file.originalFilename}</span>
              <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}