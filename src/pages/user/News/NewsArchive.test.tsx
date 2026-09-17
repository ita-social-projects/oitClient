import type { ArchivedNewsByYear } from '@shared/models/news';
import { newsService } from '@shared/services/newsService';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import NewsArchive from './NewsArchive';

const mockArchive: ArchivedNewsByYear[] = [
  {
    year: 2026,
    months: [
      {
        month: 4,
        news: [{ id: 2, title: 'April News', publishedAt: '2026-04-15' }],
      },
      {
        month: 3,
        news: [{ id: 1, title: 'March News', publishedAt: '2026-03-01' }],
      },
    ],
  },
  {
    year: 2025,
    months: [
      {
        month: 5,
        news: [{ id: 3, title: 'May News', publishedAt: '2025-05-10' }],
      },
    ],
  },
];

describe('NewsArchive', () => {
  beforeEach(() => {
    vi.spyOn(newsService, 'getNewsArchive').mockResolvedValue(mockArchive);
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

  test('renders NewsSearch component', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /search.placeholder/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/filter.dateLabel/i)).toBeInTheDocument();
    });
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

    const searchInput = screen.getByRole('textbox', { name: /search.placeholder/i });
    fireEvent.change(searchInput, { target: { value: 'nothing matches' } });

    await waitFor(() => {
      expect(screen.getByText(/news.noNews/i)).toBeInTheDocument();
    });
  });
});
