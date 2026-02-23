import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './News.module.scss';
import NewsCard from './NewsCard';

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { t } = useTranslation('public');

  useEffect(() => {
    axios.get<NewsItem[]>('/news')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setNews(data);
      })
      .catch(() => setNews([]));
  }, []);

  return (
    <div className="flex flex-col items-center py-[70px] bg-white">
      <h1 className="font-bold mb-4">{t('news.title')}</h1>
      <p className="text-sm text-meta">{t('news.subtitle')}</p>
      {news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        news.map(item => <NewsCard key={item.id} news={item} />)
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
