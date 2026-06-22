import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ModalClose,
} from '@mui/joy';
import { newsService } from '@services/newsService';
import type { NewsCardItem } from '@shared/models/news';
import { sanitizeHtmlNoImages } from '@utils/sanitize';
import { Calendar, SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './News.module.scss';

type NewsCardProps = {
  readonly news: NewsCardItem;
  readonly onDeleted: (id: number) => void;
};

export default function NewsCard({ news, onDeleted }: NewsCardProps) {
  const { t } = useTranslation('public');
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <>
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
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlNoImages(news.contentPreview) }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className={`${styles.linkButton} text-sm`}>
            <span>{t('news.readMore')}</span>
            <span className="ml-1">→</span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.edit}
              aria-label={t('news-edit.title')}
              title={t('news-edit.title')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                navigate(`/news/edit/${news.id}`);
              }}
            >
              <SquarePen size={18} />
            </button>

            <button
              type="button"
              className={styles.delete}
              aria-label={t('news-delete.title')}
              title={t('news-delete.title')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteOpen(true);
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </Link>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>{t('news-delete.title')}</DialogTitle>
          <DialogContent>
            {t('news-delete.confirmDelete')}
          </DialogContent>
          <DialogActions>
            <button
              type="button"
              className="btn-regular"
              disabled={isDeleting}
              onClick={() => {
                if (isDeleting) return;
                setIsDeleting(true);
                newsService.deleteNews(news.id)
                  .then(() => {
                    setDeleteOpen(false);
                    onDeleted(news.id);
                    toast.success(t('news-delete.deletedSuccessfully'));
                  })
                  .catch(() => {
                    toast.error(t('news-delete.deletedFailed'));
                    setDeleteOpen(false);
                  })
                  .finally(() => setIsDeleting(false));
              }}
            >
              {t('news-delete.confirmYes')}
            </button>
            <button
              type="button"
              className="btn"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
            >
              {t('news-delete.confirmNo')}
            </button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
