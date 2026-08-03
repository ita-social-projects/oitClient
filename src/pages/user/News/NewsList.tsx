import Pagination from '@shared/components/Pagination';
import type { NewsCardItem, NewsResponse } from '@shared/models/news';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';
import NewsCard from './NewsCard';
import NewsSearch from './NewsSearch';

export default function NewsListPage() {
  const [news, setNews] = useState<NewsCardItem[]>([]);
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
          date,
        },
      })
      .then(res => {
        const data = Array.isArray(res.data.content) ? res.data.content : [];
        setNews(data);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {
        setNews([]);
        setTotalPages(0);
      });
  }, [page, search, date]);

  return (
    <div className="bg-white px-6">
      <div className="flex flex-col items-center max-w-4xl mx-auto">
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
      </div>
    </div>
  );
}
