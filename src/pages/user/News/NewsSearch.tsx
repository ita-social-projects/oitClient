import { useTranslation } from 'react-i18next';

type NewsSearchProps = {
    search: string;
    setSearch: (value: string) => void;
    date: string;
    setDate: (value: string) => void;
};

export default function NewsSearch({ search, setSearch, date, setDate }: NewsSearchProps) {
    const { t } = useTranslation('public');

    return (
        <div className="w-full mt-4 mb-4 flex gap-4">
            <input
                type="text"
                placeholder={t('news.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            />
        </div>
    );
}