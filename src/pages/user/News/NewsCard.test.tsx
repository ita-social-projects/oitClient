import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NewsCard from './NewsCard';

const mockNews = {
    id: 1,
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

    test('renders news title, content, and publication date', async () => {
        setup();

        await screen.findByText('Test News');
        expect(screen.getByText('Test content for news card')).toBeInTheDocument();
        expect(screen.getByText('2026-03-02')).toBeInTheDocument();
    });

    test('links to news detail page', async () => {
        setup();

        const link = await screen.findByRole('link', { name: /Test News/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/news/1');
    });
});
