import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
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
  const [search, setSearch] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const { t, i18n } = useTranslation('public');

  useEffect(() => {
    axios.get<NewsItem[]>('/archive')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setNews(data);
      })
      .catch(() => setNews([]));
  }, []);

  const filteredNews = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return news.filter(item => {
      const matchesText = item.title.toLowerCase().includes(lowerSearch);
      const matchesDate = !date || item.publicationDate?.toString() === date;
      return matchesText && matchesDate;
    });
  }, [news, search, date]);

  const groupedFilteredNews = useMemo(() => {
    return groupNewsByYearMonth(filteredNews);
  }, [filteredNews]);

  const sortedYears = Object.keys(groupedFilteredNews).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex flex-col items-center py-[70px] bg-white">
      <h1 className="font-bold mb-4">{t('archive.title')}</h1>
      <p className="text-sm text-meta mb-8">{t('archive.subtitle')}</p>
      <Link to="/news" className={`${styles.linkButton} w-full px-6 mb-8`}>
        ← {t('archive.backToNews')}
      </Link>
      <div className="w-full mt-4 mb-4 flex gap-4">
        <input
          type="text"
          placeholder={t('news.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
        />
      </div>

      {filteredNews.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        sortedYears.map(year => {
          const sortedMonths = Object.keys(groupedFilteredNews[Number(year)])
            .sort((a, b) => Number(b) - Number(a));

          return (
            <div key={year} className="w-full px-6">
              <h2 className="text-xl font-bold mb-4">{year}</h2>

              {sortedMonths.map(month => (
                <NewsMonth
                  key={month}
                  year={Number(year)}
                  month={Number(month)}
                  items={groupedFilteredNews[Number(year)][Number(month)]}
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