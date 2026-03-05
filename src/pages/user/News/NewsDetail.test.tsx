import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import NewsDetailPage from './NewsDetail.tsx';
import { MemoryRouter } from 'react-router-dom';

vi.mock('axios');

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>;
};

const mockNews = {
    id: '1',
    title: 'Test News',
    content: 'This is a test news article',
    publicationDate: '2026-03-02',
};

describe('NewsDetailPage', () => {

    const setup = () => {
        render(
            <MemoryRouter>
                <NewsDetailPage />
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders news details after successful fetch', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: mockNews,
        });

        setup();

        await waitFor(() => {
            expect(screen.getByText('Test News')).toBeInTheDocument();
        });

        expect(screen.getByText('This is a test news article')).toBeInTheDocument();
        expect(screen.getByText('2026-03-02')).toBeInTheDocument();
    });

    test('renders not found when request fails', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('error'));

        setup();

        await waitFor(() => {
            expect(screen.getByText('news.notFound')).toBeInTheDocument();
        });

    });

    test('renders back to news link', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: mockNews,
        });

        setup();

        const link = await screen.findByText('← news.backToNews');

        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/news');
    });

});