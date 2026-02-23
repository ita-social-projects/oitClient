import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';
import { NewsMonth } from './NewsMonth';

function groupNewsByYearMonth(news: NewsItem[]) {
  return news.reduce((acc, item) => {
    if (!item.publicationDate) return acc;

    const date = new Date(item.publicationDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    acc[year] ??= {};
    acc[year][month] ??= [];
    acc[year][month].push(item);

    return acc;
  }, {} as Record<number, Record<number, NewsItem[]>>);
}

export default function NewsArchive() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [openMonths, setOpenMonths] = useState<string[]>([]);
  const { t, i18n } = useTranslation('public');

  useEffect(() => {
    axios.get<NewsItem[]>('/archive')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setNews(data);
      })
      .catch(() => setNews([]));
  }, []);

  const groupedNews = groupNewsByYearMonth(news);

  const sortedYears = Object.keys(groupedNews).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex flex-col items-center py-[70px] bg-white">
      <h1 className="font-bold mb-4">{t('archive.title')}</h1>
      <p className="text-sm text-meta mb-8">{t('archive.subtitle')}</p>
      <Link to="/news" className={`${styles.linkButton} w-full px-6 mb-8`}>
        ← {t('archive.backToNews')}
      </Link>

      {news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        sortedYears.map(year => {
          const sortedMonths = Object.keys(groupedNews[Number(year)]).sort((a, b) => Number(b) - Number(a));

          return (
            <div key={year} className="w-full px-6">
              <h2 className="text-xl font-bold mb-4">{year}</h2>

              {sortedMonths.map(month => (
                <NewsMonth
                  key={month}
                  year={Number(year)}
                  month={Number(month)}
                  items={groupedNews[Number(year)][Number(month)]}
                  openMonths={openMonths}
                  setOpenMonths={setOpenMonths}
                  language={i18n.language}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}