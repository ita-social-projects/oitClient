import SimplePagination from '@components/SimplePagination';
import { newsService } from '@services/newsService';
import AdminSearchInput from '@shared/components/AdminSearchInput';
import type { NewsAdminItem, NewsStatus } from '@shared/models/news';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './NewsAdmin.module.scss';
import NewsAdminRow from './NewsAdminRow';
import NewsFilters from './NewsFilters';

export default function NewsAdminList() {
  const { t } = useTranslation('admin');
  const [news, setNews] = useState<NewsAdminItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [statuses, setStatuses] = useState<NewsStatus[]>([]);

  const loadNews = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await newsService.getAllNewsForAdmin(page, 15, search, statuses, dateFrom, dateTo);
      if (signal?.aborted) return;

      const data = Array.isArray(res.content) ? res.content : [];
      setNews(data);
      setTotalPages(res.totalPages);
    } catch {
      if (signal?.aborted) return;
      setNews([]);
      setTotalPages(0);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, search, statuses, dateFrom, dateTo]);

  useEffect(() => {
    const controller = new AbortController();
    loadNews(controller.signal);

    return () => controller.abort();
  }, [loadNews]);

  const handleDeleted = (id: number) => {
    setNews(prev => prev.filter(n => n.id !== id));
    toast.success(t('news-delete.deletedSuccessfully'));
  };

  const handleApplyFilters = (newDateFrom: string, newDateTo: string, newStatuses: NewsStatus[]) => {
    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
    setStatuses(newStatuses);
    setPage(0);
  };

  const renderContent = () => {
    if (loading) {
      return <p>{t('news.loading')}</p>;
    }

    if (news.length === 0) {
      return <p>{t('news.noNews')}</p>;
    }

    return (
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
    );
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

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <AdminSearchInput search={search} setSearch={setSearch} setPage={setPage} />
        </div>
        <NewsFilters appliedDateFrom={dateFrom} appliedDateTo={dateTo} appliedStatuses={statuses} onApply={handleApplyFilters}
        />
      </div>

      {renderContent()}

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
