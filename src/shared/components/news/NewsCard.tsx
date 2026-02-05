import React from 'react';
import type { NewsItem } from '@shared/models/news';
import styles from './NewsCard.module.scss';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type NewsCardProps = {
  news: NewsItem;
};

export default function NewsCard({ news }: NewsCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const handleClick = () => {
    navigate(`/news/${news.id}`); 
  };

  const getPreviewText = (text: string, maxLength = 180) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
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
      <div className={styles.preview}>
        {getPreviewText(news.content)}
      </div>
      <div className={styles.more} onClick={handleClick}>
        <span className={styles.readMore}>{t('readMore')}</span>
        <span className={styles.arrow}>→</span>
      </div>
    </div>
    );
}