import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';

import styles from './Auth.module.scss';
import { authService } from '../../shared/services/authService';

export function CheckEmailPage() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') ?? '';

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      await authService.resendVerification(email);
      setResendMessage(t('checkEmail.resendSuccess'));
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 400) {
        setResendMessage(t('checkEmail.resendCooldown'));
      } else if (status === 409) {
        navigate('/signIn');
      } else {
        setResendMessage(t('checkEmail.resendError'));
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`${styles.form} shadow-lg`}>
      <i className="fa-solid fa-envelope-circle-check text-4xl text-primary-100 text-center block" />
      <h1 className="mt-4 text-center">{t('checkEmail.title')}</h1>
      <p className="mt-2 text-center text-gray-500">
        {t('checkEmail.subtitle')} <strong>{email}</strong>
      </p>
      <p className="mt-1 text-center text-gray-400 text-sm">
        {t('checkEmail.hint')}
      </p>

      {resendMessage && (
        <p className="mt-3 text-center text-sm text-primary-100">{resendMessage}</p>
      )}

      <button
        className="btn-regular w-full mt-6"
        onClick={handleResend}
        disabled={isResending}
      >
        {isResending ? t('checkEmail.resending') : t('checkEmail.resendButton')}
      </button>

      <button
        className="btn-outline w-full mt-2"
        onClick={() => navigate('/signIn')}
      >
        {t('toLogin')}
      </button>
    </div>
  );
}