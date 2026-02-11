import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';


export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation('public');

  useEffect(() => {
    axios.get<NewsItem>(`/news/${id}`)
      .then(res => setNews(res.data))
  }, [id]); 

  if (!news) return <p>{t('news.notFound')}</p>;

  return (
    <div className="flex flex-col md:py-[70px] md:px-[120px] bg-white">
      <button className="mb-6 text-primary-100 hover:text-secondary text-left" onClick={() => navigate(-1)}>
        ← {t('news.backToNews')}
      </button>
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
      <div className="text-base leading-relaxed text-text">
        {news.content}
      </div>
    </div>
  );
}