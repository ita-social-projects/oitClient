import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import Editor from '@shared/components/Editor/Editor';
import { BackButton } from '@shared/components/BackButton/BackButton';
import styles from './NewsForm.module.scss';

// MUI Joy
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ModalClose,
} from '@mui/joy';
import { newsService } from '@services/newsService';
import type { NewsDto } from '@shared/models/news';
import { useNavigate } from 'react-router-dom';
import { Files } from 'lucide-react';
import LangButton from '@components/LangButton/LangButton';

const NewsForm: React.FC = () => {
  const { t } = useTranslation('public');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<NewsDto>({ mode: 'onChange' });

  const [open, setOpen] = useState(false);
  const [pendingData, setPendingData] = useState<NewsDto | null>(null);

  const submitToServer = async (data: NewsDto) => {
    const payload = {
      title: data.title,
      content: data.content,
      publishNow: data.publishNow,
    };

    await newsService
      .createNews(payload)
      .then(() => {
        navigate('/admin/news');
      })
      .catch(error => {
        console.error('Error creating news:', error);
      });
  };

  const onSubmit = (data: NewsDto) => {
    setPendingData(data);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingData) {
      await submitToServer({ ...pendingData, publishNow: true });
    }
    setOpen(false);
    setPendingData(null);
  };

  const handleCancel = async () => {
    if (pendingData) {
      await submitToServer({ ...pendingData, publishNow: false });
    }
    setOpen(false);
    setPendingData(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls = await newsService.saveImages(Array.from(files));
      // TODO: do smth with imageUrls.data which is array of strings, then insert them into content using Editor's API
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
            <Editor className={styles.editor1} value={field.value} onChange={field.onChange} />
          )}
        />

        {/* <button
          disabled
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
        /> */}

        <button type="submit" className="btn-regular w-[200px] ml-auto mt-auto" disabled={!isValid}>
          {t('news-create.submitButton')}
        </button>
      </form>

      <LangButton className="btn-regular absolute top-4 right-4 w-[180px]" />

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>{t('news-create.publishTitle')}</DialogTitle>
          <DialogContent>{t('news-create.publishContent')}</DialogContent>
          <DialogActions>
            <button type="submit" className="btn-regular" onClick={handleConfirm}>
              {t('news-create.publishConfirm')}
            </button>
            <button type="submit" className="btn" onClick={handleCancel}>
              {t('news-create.publishCancel')}
            </button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default NewsForm;
