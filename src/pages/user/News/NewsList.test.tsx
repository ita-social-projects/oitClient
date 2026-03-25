import type { NewsItem } from '@shared/models/news';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import NewsListPage from './NewsList';

const mockNews: NewsItem[] = [
    { id: 1, title: 'Breaking News', content: 'Something happened', publicationDate: '2026-03-01' },
    { id: 2, title: 'Tech News', content: 'Tech stuff', publicationDate: '2026-03-02' },
];

vi.mock('axios');
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe('NewsListPage', () => {

    const setup = () => {
        render(
            <MemoryRouter>
                <NewsListPage />
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        mockedAxios.get = vi.fn().mockResolvedValue({ data: mockNews });
    });

    test('renders news items after fetching', async () => {
        setup();

        await waitFor(() => {
            expect(screen.getByText('Breaking News')).toBeInTheDocument();
            expect(screen.getByText('Tech News')).toBeInTheDocument();
        });

        expect(screen.getByRole('link', { name: /archive/i })).toBeInTheDocument();
    });

    test('filters news items based on search text', async () => {
        setup();
        await screen.findByText('Breaking News');

        const searchInput = screen.getByLabelText('news.searchPlaceholder') as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'Tech' } });

        await waitFor(() => {
            expect(screen.getByText('Tech News')).toBeInTheDocument();
            expect(screen.queryByText('Breaking News')).not.toBeInTheDocument();
        });
    });

    test('filters news items based on selected date', async () => {
        setup();
        await screen.findByText('Breaking News');
        
        const dateInput = screen.getByLabelText('news.dateFilterLabel') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2026-03-01' } });

        await waitFor(() => {
            expect(screen.getByText('Breaking News')).toBeInTheDocument();
            expect(screen.queryByText('Tech News')).not.toBeInTheDocument();
        });
    });

    test('shows "no news" message if filtered result is empty', async () => {
        setup();
        await screen.findByText('Breaking News');

        const searchInput = screen.getByRole('textbox', { name: /news.searchPlaceholder/i });
        fireEvent.change(searchInput, { target: { value: 'nothing matches' } });

        await waitFor(() => {
            expect(screen.getByText(/news.noNews/i)).toBeInTheDocument();
        });
    });
});
