import type { NewsCardItem } from '@shared/models/news';
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
      className={`block w-full bg-white rounded-lg shadow-md p-4 my-3 ${styles.card}`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start text-black">
          <div className="font-semibold text-lg flex-1 pr-2 leading-snug">{news.title}</div>
          {news.publishedAt && (
            <div className="flex items-center gap-1 text-xs text-meta shrink-0 whitespace-nowrap">
              <Calendar size={14} />
              {new Date(news.publishedAt).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: news.contentPreview }}
        />
      </div>
      <div className={`${styles.linkButton} text-sm mt-3`}>
        <span>{t('news.readMore')}</span>
        <span className="ml-1">→</span>
      </div>
    </Link>
  );
}
