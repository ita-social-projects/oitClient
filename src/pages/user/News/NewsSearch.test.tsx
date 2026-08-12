import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import NewsSearch from './NewsSearch.tsx';

describe('NewsSearch', () => {
    const setup = (overrides?: { search?: string; date?: string }) => {
        const setSearch = vi.fn();
        const setDate = vi.fn();
        const setPage = vi.fn();

        const props = {
            search: overrides?.search ?? '',
            setSearch,
            date: overrides?.date ?? '',
            setDate,
            setPage,
        };

        render(<NewsSearch {...props} />);

        return { props, setSearch, setDate, setPage };
    };

    test('renders search and date inputs with correct accessibility labels', () => {
        setup();

        const searchInput = screen.getByLabelText('search.placeholder');
        const dateInput = screen.getByLabelText('filter.dateLabel');

        expect(searchInput).toBeInTheDocument();
        expect(dateInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('type', 'text');
        expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('uses translation key as placeholder for search input', () => {
        setup();

        const searchInput = screen.getByLabelText('search.placeholder');
        expect(searchInput).toHaveAttribute('placeholder', 'search.placeholder');
    });

    test('calls setSearch when search input value changes', () => {
        const { setSearch } = setup({ search: '' });

        const searchInput = screen.getByLabelText('search.placeholder') as HTMLInputElement;

        fireEvent.change(searchInput, { target: { value: 'breaking news' } });

        expect(setSearch).toHaveBeenCalledTimes(1);
        expect(setSearch).toHaveBeenCalledWith('breaking news');
    });

    test('calls setDate when date input value changes', () => {
        const { setDate } = setup({ date: '' });

        const dateInput = screen.getByLabelText('filter.dateLabel') as HTMLInputElement;

        fireEvent.change(dateInput, { target: { value: '2026-03-02' } });

        expect(setDate).toHaveBeenCalledTimes(1);
        expect(setDate).toHaveBeenCalledWith('2026-03-02');
    });
});
