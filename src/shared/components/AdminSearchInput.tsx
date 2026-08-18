import Input from '@components/Input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AdminSearchInputProps = Readonly<{
  search: string;
  setSearch: (value: string) => void;
  setPage: (value: number) => void;
  placeholder?: string;
}>;

export default function AdminSearchInput({ search, setSearch, setPage, placeholder }: AdminSearchInputProps) {
  const { t } = useTranslation('common');

  return (
    <Input
      type="text"
      aria-label={placeholder || t('search.placeholder')}
      placeholder={placeholder || t('search.placeholder')}
      value={search}
      icon={<Search size={16} />}
      onChange={e => {
        setSearch(e.target.value);
        setPage(0);
      }}
    />
  );
}