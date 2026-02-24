import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';
import NewsCard from './NewsCard';

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const { t } = useTranslation('public');

  useEffect(() => {
    axios.get<NewsItem[]>('/news')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setNews(data);
      })
      .catch(() => setNews([]));
  }, []);

  const filteredNews = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return news.filter(item => {
      const matchesText =
        item.title.toLowerCase().includes(lowerSearch) ||
        item.content.toLowerCase().includes(lowerSearch);

      const matchesDate = !date || item.publicationDate === date;

      return matchesText && matchesDate;
    });
  }, [news, search, date]);

  return (
    <div className="flex flex-col items-center py-[70px] bg-white">
      <h1 className="font-bold mb-4">{t('news.title')}</h1>
      <p className="text-sm text-meta">{t('news.subtitle')}</p>
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
        filteredNews.map(item => <NewsCard key={item.id} news={item} />)
      )}
      <div className="w-full mt-16 pt-8 border-t border-gray-100">
        <p className="text-meta mb-2">
          {t('archive.ctaText')}
        </p>
        <Link to="/archive" className={`${styles.linkButton} text-sm`}>
          <span>{t('archive.browse')}</span>
          <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}
