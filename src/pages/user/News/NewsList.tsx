import React, { useEffect, useState } from 'react';
import NewsCard from '@components/news/NewsCard';
import type { NewsItem } from '@shared/models/news';
import styles from './News.module.scss';

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]); 
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Завантаження новин...</p>;

  return (
    <div className={styles.page}>
      <h1>Новини</h1>
      <p className={styles.subtitle}>
        Дізнавайтеся першими про анонси та новини ІТ-олімпіад
      </p>
      {news.length === 0 ? (
        <p>Немає новин</p>
      ) : (
        news.map(item => <NewsCard key={item.id} news={item} />)
      )}
    </div>
  );
}