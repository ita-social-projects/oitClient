import type { ArchivedNewsByYear } from '@shared/models/news';
import { newsService } from '@shared/services/newsService';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './News.module.scss';
import { NewsMonth } from './NewsMonth';
import NewsSearch from './NewsSearch';

export default function NewsArchive() {
  const [archiveData, setArchiveData] = useState<ArchivedNewsByYear[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openMonths, setOpenMonths] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const { t, i18n } = useTranslation('public');
  const setPage = (_: number) => {}; // Placeholder since pagination is not needed in archive

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    newsService
      .getNewsArchive()
      .then(data => {
        if (isMounted) {
          const validData = Array.isArray(data) ? data : [];
          setArchiveData(validData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setArchiveData([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArchive = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    return archiveData
      .map(yearGroup => {
        const filteredMonths = yearGroup.months
          .map(monthGroup => {
            const filteredNews = monthGroup.news.filter(item => {
              const matchesText = !lowerSearch || item.title.toLowerCase().includes(lowerSearch);
              const matchesDate = !date || item.publishedAt?.startsWith(date);
              return matchesText && matchesDate;
            });

            return {
              ...monthGroup,
              news: filteredNews,
            };
          })
          .filter(monthGroup => monthGroup.news.length > 0);

        return {
          ...yearGroup,
          months: filteredMonths,
        };
      })
      .filter(yearGroup => yearGroup.months.length > 0);
  }, [archiveData, search, date]);

  return (
    <div className="bg-white px-0 sm:px-6">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="font-bold mb-4 text-center">{t('archive.title')}</h1>
        <p className="text-sm text-meta text-center mb-6">{t('archive.subtitle')}</p>
        <Link to="/news" className={`${styles.linkButton} inline-block mb-2`}>
          ← {t('archive.backToNews')}
        </Link>
        <NewsSearch search={search} setSearch={setSearch} date={date} setDate={setDate} setPage={setPage} />

        {loading ? (
          <p>{t('news.loading')}</p>
        ) : filteredArchive.length === 0 ? (
          <p>{t('news.noNews')}</p>
        ) : (
          filteredArchive.map(yearGroup => (
            <div key={yearGroup.year} className="w-full mb-6">
              <h2 className="text-xl font-bold mb-4">{yearGroup.year}</h2>

              {yearGroup.months.map(monthGroup => (
                <NewsMonth
                  key={monthGroup.month}
                  year={yearGroup.year}
                  month={monthGroup.month}
                  items={monthGroup.news}
                  openMonths={openMonths}
                  setOpenMonths={setOpenMonths}
                  language={i18n.language}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
