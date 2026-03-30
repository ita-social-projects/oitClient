import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import NewsDetailPage from './NewsDetail';

vi.mock('axios');

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>;
};

const mockNews = {
    id: 1,
    title: 'Test News',
    contentPreview: 'This is a test news article',
    publishedAt: '2026-03-02',
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
        mockedAxios.get = vi.fn().mockResolvedValue({ data: mockNews });
    });

    test('renders news details after successful fetch', async () => {
        setup();

        await waitFor(() => {
            expect(screen.getByText('Test News')).toBeInTheDocument();
        });
    });

    test('renders not found when request fails', async () => {
        mockedAxios.get = vi.fn().mockRejectedValue(new Error('Failed to fetch news'));
        setup();

        await waitFor(() => {
            expect(screen.getByText('news.notFound')).toBeInTheDocument();
        });

    });

    test('renders back to news link', async () => {
        setup();

        const link = await screen.findByText('← news.backToNews');

        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/news');
    });
});