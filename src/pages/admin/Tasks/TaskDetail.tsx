import { BackButton } from '@components/BackButton';
import { taskService } from '@services/taskService';
import { axiosInstance } from '@shared/api/axiosInstance.ts';
import type { TaskFileDto, TaskItem } from '@shared/models/task';
import { Eye, EyeOff, FileText, FileLock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './Tasks.module.scss';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const filesByRole = (files: TaskFileDto[], role: string) => files.filter(f => f.fileRole === role);

const downloadFile = async (file: TaskFileDto) => {
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

  const [task, setTask] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadTask = async () => {
      setLoading(true);
      try {
        const data = await taskService.getTaskById(Number(id));
        setTask(data);
      } catch {
        toast.error(t('task-detail.notFound'));
        navigate('/profile/tasks');
      } finally {
        setLoading(false);
      }
    };
    loadTask();
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

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        {task.description && <p className="mt-2 text-sm text-gray-600">{task.description}</p>}
        <div className="flex gap-2 mt-3">
          <span className={styles.infoBadge}>
            {t('task-detail.createdBy')}: {task.createdBy}
          </span>
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
    </div>
  );
}

function FileGroupCard({
  title,
  files,
  visible,
}: Readonly<{
  title: string;
  files: TaskFileDto[];
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
              onClick={() => downloadFile(file)}
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
