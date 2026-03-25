import type { NewsItem, NewsResponse } from '@shared/models/news';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';
import NewsCard from './NewsCard';
import NewsSearch from './NewsSearch';
import Pagination from './Pagination';

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const { t } = useTranslation('public');

  useEffect(() => {
    axios
      .get<NewsResponse>('/api/v1/news', {
        params: {
          page,
          size: 5,
          search,
          date
        },
      })
      .then(res => {
        const data = Array.isArray(res.data.content) ? res.data.content : [];
        setNews(data);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setNews([]));
  }, [page, search, date]);

  return (
    <div className="flex flex-col items-center bg-white max-w-4xl mx-auto px-6">
      <h1 className="font-bold mb-4">{t('news.title')}</h1>
      <p className="text-sm text-meta">{t('news.subtitle')}</p>

      <NewsSearch
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        setPage={setPage}
      />

      {news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        news.map(item => <NewsCard key={item.id} news={item} />)
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <div className="w-full mt-16 pt-8 border-t border-gray-100">
        <p className="text-meta mb-2">{t('archive.ctaText')}</p>
        <Link to="/archive" className={`${styles.linkButton} text-sm`}>
          <span>{t('archive.browse')}</span>
          <span className="ml-1">→</span>
        </Link>
      </div>
      <Link to="/news/create" className={`${styles.linkButton} absolute top-4 right-4 text-sm`}>
        <i className="fa-solid fa-plus mr-2"></i>
        {t('news.createButton')}
      </Link>
    </div>
  );
}
