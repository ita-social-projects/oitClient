import Input from '@shared/components/Input/Input';
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
  const { t } = useTranslation('public');

  return (
    <div className="w-full mt-4 mb-4 flex gap-4">
      <Input
        type="text"
        aria-label={t('news.searchPlaceholder')}
        placeholder={t('news.searchPlaceholder')}
        value={search}
        icon={<Search size={16} />}
        onChange={e => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />
      <Input
        type="date"
        aria-label={t('news.dateFilterLabel')}
        value={date}
        onChange={e => {
          setDate(e.target.value);
          setPage(0);
        }}
        onFocus={e => (e.target as HTMLInputElement).showPicker?.()}
      />
    </div>
  );
}
