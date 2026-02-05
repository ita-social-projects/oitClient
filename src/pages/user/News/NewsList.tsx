import React, { useEffect, useState } from 'react';
import NewsCard from '@components/news/NewsCard';
import type { NewsItem } from '@shared/models/news';
import styles from './News.module.scss';
import { useTranslation } from 'react-i18next';

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]); 
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('auth');

  useEffect(() => {
    fetch('http://localhost:3001/news')
    //fetch('/news')
      .then(res => res.json())
      .then((data: NewsItem[]) => {
        data.sort(
          (a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
        );
        setNews(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t('newsLoading')}</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('newsTitle')}</h1>
      <p className={styles.subtitle}>{t('newsSubtitle')}</p>
      {news.length === 0 ? (
        <p>{t('noNews')}</p>
      ) : (
        news.map(item => <NewsCard key={item.id} news={item} />)
      )}
    </div>
  );
}