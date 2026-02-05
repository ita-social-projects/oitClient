import GoogleIcon from '@assets/google.svg';
import { useTranslation } from 'react-i18next';

import styles from './Auth.module.scss';

export const GoogleButton = () => {
  const { t } = useTranslation('auth');

  return (
    <>
      <div className="flex items-center gap-2">
        <div className={`${styles.stroke} flex-1`}></div>
        <div>{t('continueWith')}</div>
        <div className={`${styles.stroke} flex-1`}></div>
      </div>
      <button className="btn-stroked w-full flex items-center justify-center">
        <img src={GoogleIcon} alt="Google Icon" className="w-5 h-5 mr-2" />
        <span>{t('googleLabel')}</span>
      </button>
    </>
  );
};
