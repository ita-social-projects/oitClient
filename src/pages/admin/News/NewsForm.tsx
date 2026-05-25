import LangButton from '@components/LangButton/LangButton';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ModalClose,
} from '@mui/joy';
import { newsService } from '@services/newsService';
import { BackButton } from '@shared/components/BackButton/BackButton';
import Editor, { type EditorHandle } from '@shared/components/Editor/Editor';
import type { NewsDto } from '@shared/models/news';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import styles from './NewsForm.module.scss';

const NewsForm: React.FC = () => {
  const { t } = useTranslation('public');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<NewsDto>({ mode: 'onChange' });

  const [publishNow, setPublishNow] = useState(true);
  const [open, setOpen] = useState(false);
  const [pendingData, setPendingData] = useState<NewsDto | null>(null);
  const editorRef = useRef<EditorHandle | null>(null);

  const submitToServer = async (data: NewsDto) => {
    try {
      const payload = {
        title: data.title,
        content: data.content,
        publishNow: data.publishNow,
      };

      await newsService.createNews(payload);

      if (data.publishNow) {
        navigate('/news');
      } else {
        navigate('/drafts');
      }
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const onSubmit = (data: NewsDto) => {
    setPendingData({ ...data, publishNow });
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingData) {
      await submitToServer(pendingData);
    }
    setOpen(false);
    setPendingData(null);
  };

  const handleCancel = async () => {
    setOpen(false);
    setPendingData(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const response = await newsService.uploadImages(Array.from(files));
      response.data.forEach(({ url }) => {
        editorRef.current?.insertImage(url);
      });
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  return (
    <div className="bg-linear-to-br from-blue-50 to-purple-50 min-h-dvh flex items-center justify-center py-[80px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white min-h-[700px] w-[70%] shadow-lg rounded-2xl p-8 flex flex-col gap-6"
      >
        <BackButton text={t('news-create.back')} />

        <h1 className={`${styles.title} text-center`}>{t('news-create.title')}</h1>

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
            <Editor className={styles.editor1} value={field.value} onChange={field.onChange} ref={editorRef} />
          )}
        />

        <button
          type="button"
          className="btn-regular"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <i className="fa-solid fa-file-arrow-up mr-3"></i>
          {t('news-create.imageLabel')}
        </button>

        <input
          type="file"
          id="fileInput"
          className="hidden!"
          onChange={handleFileUpload}
          multiple
        />

        <div className="flex flex-col gap-3">
          {[
            { value: true, label: t('news-create.publishNow') },
            { value: false, label: t('news-create.saveAsDraft') },
          ].map(({ value, label }) => (
            <label
              key={String(value)}
              onClick={() => setPublishNow(value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-[1.5px] cursor-pointer 
        ${publishNow === value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
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

        <button type="submit" className="btn-regular w-[200px] ml-auto mt-auto" disabled={!isValid}>
          {t('news-create.submitButton')}
        </button>
      </form>

      <LangButton className="btn-regular absolute top-4 right-4 w-[180px]" />

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>{t('news-create.publishTitle')}</DialogTitle>
          <DialogContent>
            {pendingData?.publishNow
              ? t('news-create.confirmPublish')
              : t('news-create.confirmDraft')}
          </DialogContent>
          <DialogActions>
            <button type="button" className="btn-regular" onClick={handleConfirm}>
              {t('news-create.confirmYes')}
            </button>
            <button type="button" className="btn" onClick={handleCancel}>
              {t('news-create.confirmNo')}
            </button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default NewsForm;
