import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface TaskSearchProps {
  readonly search: string;
  readonly setSearch: (search: string) => void;
  readonly setPage: (page: number) => void;
}

export default function TaskSearch({ search, setSearch, setPage }: TaskSearchProps) {
  const { t } = useTranslation('admin');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={search}
        onChange={handleChange}
        placeholder={t('tasks.search')}
        className="w-full border rounded-md px-3 py-2"
      />
    </div>
  );
}
