import type { NewsItem } from '@shared/models/news';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import styles from './NewsCard.module.scss';

type NewsCardProps = {
  readonly news: NewsItem;
};

export default function NewsCard({ news }: NewsCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const handleClick = () => {
    navigate(`/news/${news.id}`); 
  };

  return (
    <div className={styles.card}>
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
        {news.content}
      </div>
      <button className={styles.more} onClick={handleClick}>
        <span className={styles.readMore}>{t('news.readMore')}</span>
        <span className={styles.arrow}>→</span>
      </button>
    </div>
  );
}