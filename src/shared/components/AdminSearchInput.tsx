import Input from '@components/Input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AdminSearchInputProps = Readonly<{
  search: string;
  setSearch: (value: string) => void;
  setPage: (value: number) => void;
}>;

export default function AdminSearchInput({ search, setSearch, setPage }: AdminSearchInputProps) {
  const { t } = useTranslation('common');

  return (
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
  );
}