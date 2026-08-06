import { useTranslation } from 'react-i18next';

type SimplePaginationProps = {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
};

export default function SimplePagination({ page, totalPages, onPageChange }: SimplePaginationProps) {
  const { t } = useTranslation('common');

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-2 rounded-md border border-gray-400 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed select-none"
      >
        ← {t('pagination.previous')}
      </button>

      <span className="text-sm text-gray-500 select-none">
        {t('pagination.page')} {page + 1} {t('pagination.of')} {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="px-3 py-2 rounded-md border border-gray-400 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed select-none"
      >
        {t('pagination.next')} →
      </button>
    </div>
  );
}