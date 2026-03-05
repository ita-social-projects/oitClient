import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NewsMonth } from './NewsMonth';

const mockItems = [
    {
        id: '1',
        title: 'March News',
        content: 'News content for March',
        publicationDate: '2026-03-01',
    },
    {
        id: '2',
        title: 'April News',
        content: 'News content for April',
        publicationDate: '2026-04-01',
    },
];

describe('NewsMonth', () => {
    let openMonths: string[];
    let setOpenMonths: (value: any) => void;

    const setup = (props?: Partial<Parameters<typeof NewsMonth>[0]>) => {
        openMonths = [];
        setOpenMonths = vi.fn(value => {
            openMonths = typeof value === 'function' ? value(openMonths) : value;
        });

        render(
            <MemoryRouter>
                <NewsMonth
                    year={2026}
                    month={2}
                    items={mockItems}
                    openMonths={openMonths}
                    setOpenMonths={setOpenMonths}
                    language="en"
                    {...props}
                />
            </MemoryRouter>
        );
    };

    test('renders month name and toggle button', () => {
        setup();
        expect(screen.getByText('March')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('does not show news items when month is closed', () => {
        setup();
        expect(screen.queryByText('March News')).not.toBeInTheDocument();
        expect(screen.queryByText('April News')).not.toBeInTheDocument();
    });

    test('opens month on click and shows news items', () => {
        setup({ openMonths: ['2026-2'] });

        expect(screen.getByText('March News')).toBeInTheDocument();
        expect(screen.getByText('April News')).toBeInTheDocument();
    });

    test('shows correct publication dates', () => {
        setup({ openMonths: ['2026-2'] });
        expect(screen.getByText('3/1/2026')).toBeInTheDocument();
        expect(screen.getByText('4/1/2026')).toBeInTheDocument();
    });

    test('links to news detail page', () => {
        setup({ openMonths: ['2026-2'] });

        const newsLink = screen.getByRole('link', { name: /March News/i });
        expect(newsLink).toBeInTheDocument();
        expect(newsLink).toHaveAttribute('href', '/news/1');
    });
});
