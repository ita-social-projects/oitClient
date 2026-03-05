import axios from 'axios';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { NewsItem } from '@shared/models/news';

import NewsArchive from './NewsArchive';

const mockNews: NewsItem[] = [
    { id: '1', title: 'March News', content: 'Content 1', publicationDate: '2026-03-01' },
    { id: '2', title: 'April News', content: 'Content 2', publicationDate: '2026-04-15' },
    { id: '3', title: 'May News', content: 'Content 3', publicationDate: '2025-05-10' },
];

vi.mock('axios');
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe('NewsArchive', () => {
    beforeEach(() => {
        mockedAxios.get = vi.fn().mockResolvedValue({ data: mockNews });
    });

    const setup = () => {
        render(
            <MemoryRouter>
                <NewsArchive />
            </MemoryRouter>
        );
    };

    test('renders title and subtitle', () => {
        setup();
        expect(screen.getByText(/archive.title/i)).toBeInTheDocument();
        expect(screen.getByText(/archive.subtitle/i)).toBeInTheDocument();
    });

    test('renders NewsSearch component', () => {
        setup();
        expect(screen.getByRole('textbox', { name: /news.searchPlaceholder/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/news.dateFilterLabel/i)).toBeInTheDocument();
    });

    test('renders years and months correctly', async () => {
        setup();

        await waitFor(() => {
            expect(screen.getByText('2026')).toBeInTheDocument();
            expect(screen.getByText('2025')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /March/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /April/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /May/i })).toBeInTheDocument();
    });

    test('shows "no news" message if filtered result is empty', async () => {
        setup();

        const searchInput = screen.getByRole('textbox', { name: /news.searchPlaceholder/i });
        fireEvent.change(searchInput, { target: { value: 'nothing matches' } });

        await waitFor(() => {
            expect(screen.getByText(/news.noNews/i)).toBeInTheDocument();
        });
    });
});
