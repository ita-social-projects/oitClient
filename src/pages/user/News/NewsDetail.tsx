import type { NewsDetailItem } from '@shared/models/news';
import axios from 'axios';
import { sanitizeHtml} from '@utils/sanitize';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

import styles from './News.module.scss';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsDetailItem | null>(null);
  const { t } = useTranslation('public');
  const location = useLocation();
  const from = location.state?.from || '/news';
  const isArchive = from === '/archive';

  useEffect(() => {
    axios
      .get<NewsDetailItem>(`/api/v1/news/${id}`)
      .then(res => setNews(res.data))
      .catch(() => setNews(null));
  }, [id]);

  if (!news) return <p>{t('news.notFound')}</p>;

  return (
    <div className="flex flex-col max-w-4xl mx-auto md:py-[70px] bg-white">
      <Link to={from} className={`${styles.linkButton} mb-4`}>
        ← {isArchive ? t('archive.backToArchive') : t('news.backToNews')}
      </Link>
      <h1 className="text-3xl font-semibold mb-4 text-left">{news.title}</h1>
      {news.publishedAt && (
        <div className="flex items-center gap-1 text-xs text-meta">
          <Calendar size={14} />
          {new Date(news.publishedAt).toLocaleDateString()}
        </div>
      )}
      <hr className="border-t border-light-gray my-4" />
      <div className="text-base leading-relaxed text-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content) }} />
    </div>
  );
}
