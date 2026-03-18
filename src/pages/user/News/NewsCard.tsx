import type { NewsItem } from '@shared/models/news';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';

type NewsCardProps = {
  readonly news: NewsItem;
};

export default function NewsCard({ news }: NewsCardProps) {
  const { t } = useTranslation('public');

  return (
    <Link
      to={`/news/${news.id}`}
      state={{ from: '/news' }}
      className={`block w-full bg-white rounded-lg shadow-md p-4 my-3 ${styles.card}`}
    >
      <div className="flex justify-between items-center text-black">
        <div className="font-semibold text-lg mb-1">{news.title}</div>
        {news.publicationDate && (
          <div className="flex items-center gap-1 text-xs text-meta">
            <Calendar size={14} />
            {news.publicationDate}
          </div>
        )}
      </div>
      <div className="text-sm text-text-100 mb-2 line-clamp-3">{news.content}</div>
      <div className={`${styles.linkButton} text-sm mt-3`}>
        <span>{t('news.readMore')}</span>
        <span className="ml-1">→</span>
      </div>
    </Link>
  );
}
