import { Link } from 'react-router-dom';

import type { NewsItem } from '@shared/models/news';

interface NewsMonthProps {
  year: number;
  month: number;
  items: NewsItem[];
  openMonths: string[];
  setOpenMonths: React.Dispatch<React.SetStateAction<string[]>>;
  language: string;
}

export const NewsMonth: React.FC<NewsMonthProps> = ({ year, month, items, openMonths, setOpenMonths, language }) => {
  const monthKey = `${year}-${month}`;
  const isOpen = openMonths.includes(monthKey);

  const monthName = new Date(year, month).toLocaleString(language, { month: 'long' });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-gray-200" />
        <button
          onClick={() =>
            setOpenMonths(prev =>
              prev.includes(monthKey) ? prev.filter(m => m !== monthKey) : [...prev, monthKey]
            )
          }
          className="flex items-center gap-2 text-sm font-semibold text-meta hover:text-black transition-colors"
        >
          <span className="capitalize">{monthName}</span>
          <span className="text-xs">{isOpen ? '▼' : '▶'}</span>
        </button>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {isOpen &&
        items.map(item => (
          <Link
            key={item.id}
            to={`/news/${item.id}`}
            state={{ from: '/archive' }}
            className="block border-b border-gray-100 py-3"
          >
            <div className="flex justify-between gap-4">
              <div className="font-medium min-w-0">{item.title}</div>
              <div className="text-xs text-meta whitespace-nowrap flex-shrink-0">
                {new Date(item.publicationDate).toLocaleDateString(language)}
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
};

