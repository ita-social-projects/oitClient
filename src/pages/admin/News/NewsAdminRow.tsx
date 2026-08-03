import { Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, DialogActions } from '@mui/joy';
import { newsService } from '@services/newsService';
import type { NewsAdminItem, NewsStatus } from '@shared/models/news';
import { SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './NewsAdmin.module.scss';

type NewsAdminRowProps = {
  readonly news: NewsAdminItem;
  readonly onDeleted: (id: number) => void;
};

export default function NewsAdminRow({ news, onDeleted }: NewsAdminRowProps) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusBadgeClass: Record<NewsStatus, string> = {
    DRAFT: styles.badgeDraft,
    PUBLISHED: styles.badgePublished,
    ARCHIVED: styles.badgeArchived,
  };

  return (
    <>
      <tr>
        <td className={styles.titleCell}>{news.title}</td>
        <td>
          <span className={statusBadgeClass[news.status]}>
            {t(`newsStatus.${news.status}`)}
          </span>
        </td>
        <td>
          {news.publishedAt
            ? new Date(news.publishedAt).toLocaleDateString()
            : new Date(news.createdAt).toLocaleDateString()}
        </td>
        <td>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.edit}
              aria-label={t('news-edit.title')}
              title={t('news-edit.title')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                navigate(`/profile/news/edit/${news.id}`);
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
        </td>
      </tr>

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