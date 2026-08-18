import Input from '@components/Input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type NewsSearchProps = Readonly<{
  search: string;
  setSearch: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  setPage: (value: number) => void;
}>;

export default function NewsSearch({ search, setSearch, date, setDate, setPage }: NewsSearchProps) {
  const { t } = useTranslation('common');

  return (
    <div className="w-full max-w-2xl mt-4 mb-4 flex gap-2 sm:gap-4">
      <div className="flex-1 min-w-0">
        <Input
          type="text"
          aria-label={t('search.placeholder')}
          placeholder={t('search.placeholder')}
          value={search}
          icon={<Search size={16} />}
          onChange={e => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <Input
          type="date"
          aria-label={t('filter.dateLabel')}
          value={date}
          onChange={e => {
            setDate(e.target.value);
            setPage(0);
          }}
          onFocus={e => (e.target as HTMLInputElement).showPicker?.()}
        />
      </div>
    </div>
  );
}
