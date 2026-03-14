import { BookOpen, Download } from 'lucide-react';
import type { Task } from '@shared/models/CompetitionArchive.types.ts';
import { useTranslation } from 'react-i18next';

export default function TaskList({
  olympiadName,
  tasks,
  onBack,
}: {
  olympiadName: string;
  tasks: Task[];
  onBack: () => void;
}) {
  const { t } = useTranslation('competition');

  const hasTasks = tasks.length > 0;

  return (
    <div className="p-8">
      <button onClick={onBack} className="text-[var(--color-primary)] mb-6">
        ← {t('archive.back')}
      </button>

      <h1 className="text-[var(--color-text)] mb-6">{olympiadName}</h1>

      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        {hasTasks ? (
          <div className="divide-y divide-[var(--color-border)]">
            {tasks.map(task => (
              <div key={task.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />

                  <div>
                    <h3 className="text-[var(--color-text)]">{task.title}</h3>

                    <p className="text-sm text-[var(--color-text-secondary)]">{task.description}</p>
                  </div>
                </div>

                <a
                  href={task.fileUrl}
                  download
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('archive.download')}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-[var(--color-text-secondary)] text-lg">{t('archive.noTasks')}</p>
          </div>
        )}
      </div>
    </div>
  );
}