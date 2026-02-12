import NewsCard from '@components/news/NewsCard';
import type { NewsItem } from '@shared/models/news';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]); 
  const { t } = useTranslation('public');

  useEffect(() => {
    axios.get<NewsItem[]>('/news')
      .then(res => {setNews(res.data); 
    });
  }, []);

  return (
    <div className="flex flex-col items-center py-[70px] bg-white">
      <h1 className="font-bold mb-4">{t('news.title')}</h1>
      <p className="text-sm text-meta">{t('news.subtitle')}</p>
      {news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        news.map(item => <NewsCard key={item.id} news={item} />)
      )}
    </div>
  );
}