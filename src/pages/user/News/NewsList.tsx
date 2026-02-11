import NewsCard from '@components/news/NewsCard';
import type { NewsItem } from '@shared/models/news';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './News.module.scss';


export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]); 
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('auth');

  useEffect(() => {
    fetch('/news')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: NewsItem[]) => {
        data.sort(
          (a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
        );
        setNews(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t('news.loading')}</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('news.title')}</h1>
      <p className={styles.subtitle}>{t('news.subtitle')}</p>
      {news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        news.map(item => <NewsCard key={item.id} news={item} />)
      )}
    </div>
  );
}