import { BookOpen } from 'lucide-react';
import type { ArchivedOlympiad } from '../CompetitionArchive.types.ts';
import { useTranslation } from 'react-i18next';

export default function OlympiadCard({ olympiad, onOpen }: { olympiad: ArchivedOlympiad; onOpen: () => void }) {
  const { t } = useTranslation('competition');

  return (
    <div
      className="bg-white rounded-xl border border-[var(--color-border)] p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-[var(--color-text)]">{olympiad.name}</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
              {olympiad.level}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            <span>
              {t('archive.year')}: {olympiad.year}
            </span>
            <span>•</span>
            <span>
              {olympiad.tasks.length} {t('archive.tasksAvailable')}
            </span>
          </div>
        </div>
        <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
      </div>
    </div>
  );
}
