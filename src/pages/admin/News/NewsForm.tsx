import { BackButton } from '@components/BackButton';
import Editor, { type EditorHandle } from '@components/Editor';
import { ConfirmModal } from '@shared/components/ConfirmModal';
import { newsService } from '@services/newsService';
import type { NewsDto } from '@shared/models/news';
import React, { useState, useRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './NewsAdmin.module.scss';

const NewsForm: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<NewsDto>({ mode: 'onChange' });

  const [publishNow, setPublishNow] = useState(true);
  const [open, setOpen] = useState(false);
  const [pendingData, setPendingData] = useState<NewsDto | null>(null);
  const editorRef = useRef<EditorHandle | null>(null);
  const [uploadedFileIds, setUploadedFileIds] = useState<Array<{ id: number; url: string }>>([]);
  const [initialFileIds, setInitialFileIds] = useState<number[]>([]);


  useEffect(() => {
    if (!id) return;

    const loadNews = async () => {
      const news = await newsService.getNewsById(Number(id));

      reset({
        title: news.title,
        content: news.content,
      });

      setPublishNow(news.status === 'PUBLISHED');

      const { data: files } = await newsService.getFilesByNewsId(Number(id));
      setInitialFileIds(files.map(f => f.id));
      setUploadedFileIds(files.map(f => ({ id: f.id, url: f.url })));
    };

    loadNews();
  }, [id, reset]);

  const submitToServer = async (data: NewsDto) => {
    const fileIds = uploadedFileIds
      .filter(({ url }) => data.content.includes(url))
      .map(({ id }) => id);

    const removedFileIds = initialFileIds.filter(id => !fileIds.includes(id));

    if (isEditMode) {
      await newsService.updateNews({
        id: Number(id),
        title: data.title,
        content: data.content,
        publishNow: data.publishNow,
        fileIds,
        removedFileIds,
      });
    } else {
      await newsService.createNews({
        title: data.title,
        content: data.content,
        publishNow: data.publishNow,
        fileIds,
      });
    }

    navigate('/profile/news');
  };

  const onSubmit = (data: NewsDto, e?: React.BaseSyntheticEvent) => {
    (document.activeElement as HTMLElement)?.blur();

    const submitterName = (e?.nativeEvent as SubmitEvent)?.submitter?.getAttribute('name');
    let finalPublishNow = publishNow;

    if (submitterName === 'actionPublish') {
      finalPublishNow = true;
    } else if (submitterName === 'actionDraft') {
      finalPublishNow = false;
    }

    setPendingData({ ...data, publishNow: finalPublishNow });
    setOpen(true);
  };

  const getSuccessMessage = (isEdit: boolean, isPublishingNow: boolean) => {
    if (isEdit) {
      if (!publishNow && isPublishingNow) {
        return t('news-edit.updatedAndPublishedSuccessfully');
      }
      return t('news-edit.updatedSuccessfully');
    }
    if (isPublishingNow) return t('news-create.createdAndPublished');
    return t('news-create.savedAsDraft');
  };

  const handleConfirm = async () => {
    if (!pendingData) return;

    try {
      await submitToServer(pendingData);

      toast.success(getSuccessMessage(isEditMode, pendingData.publishNow));

      setOpen(false);
      setPendingData(null);
    } catch {
      toast.error(t('news-create.createFailed'));
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setPendingData(null);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const response = await newsService.uploadImages([file]);
    const fileDto = response.data[0];
    setUploadedFileIds(prev => [...prev, { id: fileDto.id, url: fileDto.url }]);
    return fileDto.url;
  };

  const getDialogMessage = () => {
    if (isEditMode) {
      if (publishNow) {
        return t('news-edit.confirmUpdate');
      } else {
        return pendingData?.publishNow
          ? t('news-edit.confirmUpdateAndPublish')
          : t('news-edit.confirmUpdateAndDraft');
      }
    }
    if (pendingData?.publishNow) return t('news-create.confirmPublish');
    return t('news-create.confirmDraft');
  };

  return (
    <div className="bg-linear-to-br from-blue-50 to-purple-50 min-h-dvh flex items-center justify-center py-6 md:py-[80px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white min-h-[80dvh] md:min-h-[700px] w-[92%] sm:w-[85%] md:w-[70%] lg:w-[60%] shadow-lg rounded-2xl p-5 sm:p-8 flex flex-col gap-6"
      >
        <BackButton text={t('news-create.back')} to="/profile/news" />

        <h1 className="text-2xl sm:text-3xl text-center">
          {isEditMode
            ? t('news-edit.title')
            : t('news-create.title')}
        </h1>

        <input
          {...register('title', { required: true })}
          placeholder={t('news-create.titleLabel')}
          className="w-full"
        />

        <Controller
          name="content"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <Editor className={styles.editor1} value={field.value} onChange={field.onChange} onImageUpload={handleImageUpload} ref={editorRef} />
          )}
        />

        {!isEditMode && (
          <div className="flex flex-col gap-3">
            {[
              { value: true, label: t('news-create.publishNow') },
              { value: false, label: t('news-create.saveAsDraft') },
            ].map(({ value, label }) => (
              <label
                key={String(value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-[1.5px] cursor-pointer 
        ${publishNow === value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
              >
                <input
                  type="radio"
                  name="publishNow"
                  className="sr-only"
                  checked={publishNow === value}
                  onChange={() => setPublishNow(value)}
                />
                <span className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center
        ${publishNow === value ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'}`}>
                  {publishNow === value && <span className="w-[7px] h-[7px] rounded-full bg-white" />}
                </span>
                <span className={`font-medium ${publishNow === value ? 'text-blue-700' : 'text-gray-800'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}

        {!isEditMode ? (
          <button type="submit" className="btn-regular w-full md:w-[200px] mt-auto md:ml-auto" disabled={!isValid}>
            {t('news-create.submitButton')}
          </button>
        ) : publishNow ? (
          <button type="submit" className="btn-regular w-full md:w-[200px] mt-auto md:ml-auto" disabled={!isValid}>
            {t('news-edit.saveButton')}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-auto md:ml-auto justify-end">
            <button
              type="submit"
              name="actionDraft"
              className="btn-stroked w-full sm:w-[200px]"
              disabled={!isValid}
            >
              {t('news-edit.updateAndSaveDraft')}
            </button>
            <button
              type="submit"
              name="actionPublish"
              className="btn-regular w-full sm:w-[200px]"
              disabled={!isValid}
            >
              {t('news-edit.updateAndPublish')}
            </button>
          </div>
        )}
      </form>

      <ConfirmModal
        open={open}
        onClose={handleCancel}
        title={t('news-create.publishTitle')}
        message={getDialogMessage()}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default NewsForm;
