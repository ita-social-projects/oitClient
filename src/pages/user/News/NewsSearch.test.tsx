import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import NewsSearch from './NewsSearch.tsx';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('NewsSearch', () => {
    const setup = (overrides?: { search?: string; date?: string }) => {
        const setSearch = vi.fn();
        const setDate = vi.fn();

        const props = {
            search: overrides?.search ?? '',
            setSearch,
            date: overrides?.date ?? '',
            setDate,
        };

        render(<NewsSearch {...props} />);

        return { props, setSearch, setDate };
    };

    test('renders search and date inputs with correct accessibility labels', () => {
        setup();

        const searchInput = screen.getByLabelText('news.searchPlaceholder');
        const dateInput = screen.getByLabelText('news.dateFilterLabel');

        expect(searchInput).toBeInTheDocument();
        expect(dateInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('type', 'text');
        expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('uses translation key as placeholder for search input', () => {
        setup();

        const searchInput = screen.getByLabelText('news.searchPlaceholder');
        expect(searchInput).toHaveAttribute('placeholder', 'news.searchPlaceholder');
    });

    test('calls setSearch when search input value changes', () => {
        const { setSearch } = setup({ search: '' });

        const searchInput = screen.getByLabelText('news.searchPlaceholder') as HTMLInputElement;

        fireEvent.change(searchInput, { target: { value: 'breaking news' } });

        expect(setSearch).toHaveBeenCalledTimes(1);
        expect(setSearch).toHaveBeenCalledWith('breaking news');
    });

    test('calls setDate when date input value changes', () => {
        const { setDate } = setup({ date: '' });

        const dateInput = screen.getByLabelText('news.dateFilterLabel') as HTMLInputElement;

        fireEvent.change(dateInput, { target: { value: '2026-03-02' } });

        expect(setDate).toHaveBeenCalledTimes(1);
        expect(setDate).toHaveBeenCalledWith('2026-03-02');
    });
});
