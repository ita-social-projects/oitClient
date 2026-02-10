import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { NewsItem } from '@shared/models/news';
import styles from './NewsDetail.module.scss';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/news/${id}`) 
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: NewsItem) => setNews(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>{t('news.loading')}</p>;
  if (!news) return <p>{t('news.notFound')}</p>;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        ← {t('news.backToNews')}
      </button>
      <h1 className={styles.title}>{news.title}</h1>
      <div className={styles.meta}>
        {news.publicationDate && (
          <div className={styles.date}>
            <Calendar size={16} />
            {news.publicationDate}
          </div>
        )}
      </div>
      <hr className={styles.separator} />
      <div className={styles.content}>{news.content}</div>
    </div>
  );
}