import { ConfirmModal } from '@shared/components/ConfirmModal';
import { newsService } from '@services/newsService';
import type { NewsAdminItem, NewsStatus } from '@shared/models/news';
import { SquarePen, Trash2, Rocket } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './NewsAdmin.module.scss';

type NewsAdminRowProps = {
  readonly news: NewsAdminItem;
  readonly onDeleted: (id: number) => void;
  readonly onPublished: () => void;
};

export default function NewsAdminRow({ news, onDeleted, onPublished }: NewsAdminRowProps) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishConfirm = async () => {
    if (isPublishing) return;

    setIsPublishing(true);
    try {
      const fullNews = await newsService.getNewsById(news.id);
      const { data: files } = await newsService.getFilesByNewsId(news.id);
      await newsService.updateNews({
        id: news.id,
        title: fullNews.title,
        content: fullNews.content,
        publishNow: true,
        fileIds: files.map(f => f.id)
      });
      toast.success(t('news-create.publishedSuccessfully'));
      setPublishOpen(false);
      onPublished();
    } catch {
      toast.error(t('news-create.createFailed'));
      setPublishOpen(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const statusBadgeClass: Record<NewsStatus, string> = {
    DRAFT: styles.badgeDraft,
    PUBLISHED: styles.badgePublished,
    ARCHIVED: styles.badgeArchived,
  };

  return (
    <>
      <tr>
        <td className={styles.titleCell}>{news.title}</td>
        <td data-label={t('news.columnStatus')}>
          <span className={statusBadgeClass[news.status]}>
            {t(`newsStatus.${news.status}`)}
          </span>
        </td>
        <td data-label={t('news.columnDate')}>
          {news.publishedAt
            ? new Date(news.publishedAt).toLocaleDateString()
            : new Date(news.createdAt).toLocaleDateString()}
        </td>
        <td data-label={t('news.columnActions')}>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.publish}
              style={{ visibility: news.status === 'DRAFT' ? 'visible' : 'hidden' }}
              aria-label={t('news-create.publishNow')}
              title={t('news-create.publishNow')}
              disabled={isPublishing || news.status !== 'DRAFT'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPublishOpen(true);
              }}
            >
              <Rocket size={18} />
            </button>

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

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('news-delete.title')}
        message={t('news-delete.confirmDelete')}
        isLoading={isDeleting}
        onConfirm={() => {
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
      />

      <ConfirmModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title={t('news-create.publishTitle')}
        message={t('news-create.confirmPublish')}
        isLoading={isPublishing}
        onConfirm={handlePublishConfirm}
      />
    </>
  );
}