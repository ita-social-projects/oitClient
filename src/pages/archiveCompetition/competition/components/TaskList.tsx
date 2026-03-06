import { BookOpen, Download } from 'lucide-react';
import type { ArchivedOlympiad } from '../CompetitionArchive.types.ts';
import { useTranslation } from 'react-i18next';

export default function TaskList({ olympiad, onBack }: { olympiad: ArchivedOlympiad; onBack: () => void }) {
  const { t } = useTranslation('competition');


  return (
    <div className="p-8">
      <button onClick={onBack} className="text-[var(--color-primary)] mb-6">
        ← {t('archive.back')}
      </button>

      <h1 className="text-[var(--color-text)] mb-6">{olympiad.name}</h1>

      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="divide-y divide-[var(--color-border)]">
          {olympiad.tasks.map(task => (
            <div key={task.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-[var(--color-text)]">{task.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{task.description}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('archive.download')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}