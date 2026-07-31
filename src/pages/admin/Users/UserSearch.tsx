import Input from '@shared/components/Input/Input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type UserSearchProps = Readonly<{
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
}>;

export default function UserSearch({ search, setSearch, setPage }: UserSearchProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="w-full mt-4 mb-6">
      <Input
        type="text"
        value={search}
        icon={<Search size={16} />}
        placeholder={t('users.searchPlaceholder')}
        aria-label={t('users.searchPlaceholder')}
        onChange={e => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />
    </div>
  );
}
