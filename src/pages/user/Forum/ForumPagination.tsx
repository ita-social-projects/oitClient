import { useTranslation } from 'react-i18next';

type ForumPaginationProps = Readonly<{
  pageNumber: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}>;

export const ForumPagination = ({
  pageNumber,
  totalPages,
  first,
  last,
  disabled = false,
  onPageChange,
}: ForumPaginationProps) => {
  const { t } = useTranslation('forum');

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-4" aria-label={t('pagination.label')}>
      <button
        type="button"
        className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={first || disabled}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        {t('pagination.previous')}
      </button>

      <span className="text-sm text-slate-600">
        {t('pagination.page', {
          current: pageNumber + 1,
          total: totalPages,
        })}
      </span>

      <button
        type="button"
        className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={last || disabled}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        {t('pagination.next')}
      </button>
    </nav>
  );
};
