import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NewsArchive() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { t, i18n } = useTranslation('public');

  const groupedNews = news.reduce((acc, item) => {
    if (!item.publicationDate) return acc;

    const date = new Date(item.publicationDate);
    const year = date.getFullYear();
    const month = date.getMonth(); 

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];

    acc[year][month].push(item);

    return acc;
  }, {} as Record<number, Record<number, NewsItem[]>>);

  useEffect(() => {
    axios
      .get<NewsItem[]>('http://localhost:3001/archive')
      .then(res => setNews(res.data));
  }, []);

  return (
    <div className="flex flex-col items-center py-[70px] bg-white">
      <h1 className="font-bold mb-4">{t('archive.title')}</h1>
      <p className="text-sm text-meta mb-8">
        {t('archive.subtitle')}
      </p>

      {news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        Object.keys(groupedNews)
          .sort((a, b) => Number(b) - Number(a))
          .map(year => (
            <div key={year} className="w-full px-6">
              <h2 className="text-xl font-bold mb-4">{year}</h2>

              {Object.keys(groupedNews[Number(year)])
                .sort((a, b) => Number(b) - Number(a))
                .map(month => {
                  const monthName = new Date(
                    2024,
                    Number(month)
                  ).toLocaleString(i18n.language, {
                    month: 'long',
                  });

                  return (
                    <div key={month} className="mb-6">
                      <h3 className="text-sm font-semibold text-meta mb-2 capitalize">
                        {monthName}
                      </h3>

                      {groupedNews[Number(year)][Number(month)].map(item => (
                        <Link
                          key={item.id}
                          to={`/news/${item.id}`}
                          className="block border-b border-gray-100 py-3 hover:bg-gray-50"
                        >
                          <div className="flex justify-between gap-4">
                            <div className="font-medium min-w-0">
                              {item.title}
                            </div>

                            <div className="text-xs text-meta whitespace-nowrap flex-shrink-0">
                              {new Date(item.publicationDate)
                                .toLocaleDateString(i18n.language)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                })}
            </div>
          ))
      )}
    </div>
  );
}
