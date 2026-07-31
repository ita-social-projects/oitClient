import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import type { NewsAdminItem } from '@shared/models/news';

import styles from './NewsAdmin.module.scss';
import NewsAdminRow from './NewsAdminRow';
import Pagination from '@shared/components/Pagination';
import { newsService } from '@services/newsService';

export default function NewsAdminList() {
  const { t } = useTranslation('admin');
  const [news, setNews] = useState<NewsAdminItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNews = () => {
  setLoading(true);
  newsService
    .getAllNewsForAdmin(page, 10)
    .then(res => {
      const data = Array.isArray(res.content) ? res.content : [];
      setNews(data);
      setTotalPages(res.totalPages);
    })
    .catch(() => {
      setNews([]);
      setTotalPages(0);
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, [page]);

  const handleDeleted = (id: number) => {
    setNews(prev => prev.filter(n => n.id !== id));
    toast.success(t('news-delete.deletedSuccessfully'));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl">{t('news.title')}</h1>
        <Link to="/profile/news/create" className="btn-regular">
          <i className="fa-solid fa-plus mr-2"></i>
          {t('news.createButton')}
        </Link>
      </div>

      {loading ? (
        <p>{t('news.loading')}</p>
      ) : news.length === 0 ? (
        <p>{t('news.noNews')}</p>
      ) : (
        <table className={`${styles.table} w-full`}>
          <thead>
            <tr>
              <th>{t('news.columnTitle')}</th>
              <th>{t('news.columnStatus')}</th>
              <th>{t('news.columnDate')}</th>
              <th>{t('news.columnActions')}</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <NewsAdminRow key={item.id} news={item} onDeleted={handleDeleted} />
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}