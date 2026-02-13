import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';

export default function NewsArchive() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { t } = useTranslation('public');

  useEffect(() => {
    axios.get<NewsItem[]>('http://localhost:3001/archive').then(res => {
      setNews(res.data);
    });
  }, []);

  return (
    <div className="flex flex-col items-center py-[70px] bg-white">
      <h1 className="font-bold mb-4">{t('archive.title')}</h1>
      <p className="text-sm text-meta">{t('archive.subtitle')}</p>
      {news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        news.map(item => (
          <Link key={item.id} to={`/news/${item.id}`} className="w-full block">
            <div className={`w-full bg-white rounded-lg shadow-md p-4 my-3 ${styles.card}`}>
              <div className="flex justify-between items-center text-black">
                <div className="text-lg mb-1">{item.title}</div>
                {item.publicationDate && (
                  <div className="flex items-center gap-1 text-xs text-meta whitespace-nowrap flex-shrink-0">
                    <Calendar size={14} />
                    {item.publicationDate}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
