import type { NewsCardItem } from '@shared/models/news';
import { sanitizeHtmlNoImages } from '@utils/sanitize';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';

type NewsCardProps = {
  readonly news: NewsCardItem;
};

export default function NewsCard({ news }: NewsCardProps) {
  const { t } = useTranslation('public');

  return (
    <Link
      to={`/news/${news.id}`}
      state={{ from: '/news' }}
      className={`block w-full bg-white rounded-lg shadow-md p-4 my-3 overflow-hidden ${styles.card}`}
    >
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start text-black gap-2 sm:gap-0">
          <div className="font-semibold text-base sm:text-lg flex-1 min-w-0 pr-0 sm:pr-2 leading-snug break-words">{news.title}</div>
          {news.publishedAt && (
            <div className="flex items-center gap-1 text-xs text-meta shrink-0 whitespace-nowrap">
              <Calendar size={14} />
              {new Date(news.publishedAt).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed break-words"
          dangerouslySetInnerHTML={{ __html: sanitizeHtmlNoImages(news.contentPreview) }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className={`${styles.linkButton} text-sm`}>
          <span>{t('news.readMore')}</span>
          <span className="ml-1">→</span>
        </div>
      </div>
    </Link>
  );
}
