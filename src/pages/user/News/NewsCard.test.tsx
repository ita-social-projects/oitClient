import { render, screen } from '@testing-library/react';
import axios from "axios";
import NewsCard from "./NewsCard";
import { MemoryRouter } from "react-router-dom";

vi.mock('axios');

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>;
};

const mockNews = {
    id: '1',
    title: 'Test News',
    content: 'Test content for news card',
    publicationDate: '2026-03-02',
};

describe('NewsCard', () => {

    const setup = () => {
        render(
            <MemoryRouter>
                <NewsCard news={mockNews} />
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders news title, content, and publication date', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: mockNews,
        });

        setup();

        await screen.findByText('Test News');
        expect(screen.getByText('Test content for news card')).toBeInTheDocument();
        expect(screen.getByText('2026-03-02')).toBeInTheDocument();
    });

    test('links to news detail page', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: mockNews,
        });

        setup();

        const link = await screen.findByRole('link', { name: /Test News/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/news/1');
    });
});
