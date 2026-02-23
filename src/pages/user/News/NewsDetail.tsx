import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

import styles from './News.module.scss';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const { t } = useTranslation('public');
  const location = useLocation();
  const from = location.state?.from || '/news';
  const isArchive = from === '/archive';

  useEffect(() => {
    axios.get<NewsItem>(`/news/${id}`)
      .then(res => setNews(res.data))
      .catch(() => setNews(null));
  }, [id]);

  if (!news) return <p>{t('news.notFound')}</p>;

  return (
    <div className="flex flex-col md:py-[70px] md:px-[120px] bg-white">
      <Link
        to={from}
        className={`${styles.linkButton} mb-4`}
      >
        ← {isArchive
          ? t('archive.backToArchive')
          : t('news.backToNews')}
      </Link>
      <h1 className="text-3xl font-semibold mb-4 text-left">{news.title}</h1>
      <div className="flex flex-col text-meta text-sm mb-2">
        {news.publicationDate && (
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            {news.publicationDate}
          </div>
        )}
      </div>
      <hr className="border-t border-light-gray my-4" />
      <div className="text-base leading-relaxed text-text">{news.content}</div>
    </div>
  );
}
