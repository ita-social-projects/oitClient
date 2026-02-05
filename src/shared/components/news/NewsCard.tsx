import React from 'react';
import type { NewsItem } from '@shared/models/news';
import styles from './NewsCard.module.scss';
import { Calendar } from 'lucide-react';

type NewsCardProps = {
  news: NewsItem;
};

export default function NewsCard({ news }: NewsCardProps) {
    const handleClick = () => {
      alert(`Open news ${news.id}`);
    };

    return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.header}>
        <div className={styles.title}>{news.title}</div>
        {news.publicationDate && (
          <div className={styles.date}>
            <Calendar size={14} /> 
            {news.publicationDate}
          </div>
        )}
      </div>
      {news.subtitle && <div className={styles.subtitle}>{news.subtitle}</div>}
      <div className={styles.more} onClick={handleClick}>
        Детальніше <span className={styles.arrow}>→</span>
      </div>
    </div>
    );
}