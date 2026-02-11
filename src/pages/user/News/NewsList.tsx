import NewsCard from '@components/news/NewsCard';
import type { NewsItem } from '@shared/models/news';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './News.module.scss';


export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]); 
  const { t } = useTranslation('auth');

  useEffect(() => {
    fetch('/news')
      .then(res => res.json())
      .then((data: NewsItem[]) => {
        data.sort(
          (a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
        );
        setNews(data);
      });
  }, []);

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