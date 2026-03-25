import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import NewsListPage from './NewsList';

const mockNewsResponse = {
    content: [
        { id: 1, title: 'Breaking News', contentPreview: 'Something happened', publishedAt: '2026-03-01' },
        { id: 2, title: 'Tech News', contentPreview: 'Tech stuff', publishedAt: '2026-03-02' },
    ],
    totalPages: 1,
};

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
        mockedAxios.get = vi.fn().mockResolvedValue({ data: mockNewsResponse });
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
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/news', expect.objectContaining({
                params: expect.objectContaining({ search: 'Tech', page: 0 }),
            }));
        });
    });

    test('filters news items based on selected date', async () => {
        setup();
        await screen.findByText('Breaking News');

        const dateInput = screen.getByLabelText('news.dateFilterLabel') as HTMLInputElement;
        fireEvent.change(dateInput, { target: { value: '2026-03-01' } });

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/news', expect.objectContaining({
                params: expect.objectContaining({ date: '2026-03-01', page: 0 }),
            }));
        });
    });

    test('shows "no news" message if filtered result is empty', async () => {
        mockedAxios.get = vi.fn().mockResolvedValue({ data: { content: [], totalPages: 0 } });
        setup();

        await waitFor(() => {
            expect(screen.getByText(/news.noNews/i)).toBeInTheDocument();
        });
    });
});
