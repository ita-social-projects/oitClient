import { useTranslation } from 'react-i18next';

type NewsSearchProps = Readonly<{
    search: string;
    setSearch: (value: string) => void;
    date: string;
    setDate: (value: string) => void;
}>;

export default function NewsSearch({ search, setSearch, date, setDate }: NewsSearchProps) {
    const { t } = useTranslation('public');

    return (
        <div className="w-full mt-4 mb-4 flex gap-4">
            <input
                type="text"
                aria-label={t('news.searchPlaceholder')}
                placeholder={t('news.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <input
                type="date"
                aria-label={t('news.dateFilterLabel')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
            />
        </div>
    );
}