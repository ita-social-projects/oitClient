import { userService } from '@services/userService';
import { emailRegex } from '@shared/regex';
import useAuth from '@shared/state/authState';
import { useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import styles from './Auth.module.scss';
import FormField from './FormField';
import { BackButton } from '../../shared/components/BackButton/BackButton';
import { authService } from '../../shared/services/authService';

export function SignIn() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [activationError, setActivationError] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      await authService.resendVerification(pendingEmail);
      setResendMessage(t('checkEmail.resendSuccess'));
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 400) {
        setResendMessage(t('checkEmail.resendCooldown'));
      } else if (status === 409) {
        setResendMessage(t('checkEmail.alreadyActivated'));
      } else {
        setResendMessage(t('checkEmail.resendError'));
      }
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: FieldValues) => {
    setGeneralError(null);
    setActivationError(false);
    setResendMessage('');

    try {
      const response = await authService.login({
        username: data.email,
        password: data.password
      });
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      const profile = await userService.getProfile();
      useAuth.getState().login(profile.data);

      navigate('/profile');
    } catch (error: any) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;

      if (status === 409 && code === 'USER_NOT_ACTIVATED') {
        setPendingEmail(data.email);
        setActivationError(true);
        return;
      } else if (status === 409 && code === 'USER_BLOCKED') {
        setGeneralError(t('signIn.accountBlocked'));
      } else if (status === 404 && code === 'USER_NOT_FOUND') {
        setGeneralError(t('signIn.invalidCredentials'));
      } else {
        setGeneralError(t('signIn.invalidCredentials'));
      }
    }
  };

  return (
    <form className={`${styles.form} shadow-lg`} onSubmit={handleSubmit(onSubmit)}>
      <BackButton text={t('toHome')} />
      <h1 className="mt-4 text-center">{t('signIn.title')}</h1>
      <p className="mt-2 text-center text-gray-500">{t('signIn.subtitle')}</p>
      <div className="flex flex-col gap-4 mt-3">
        <FormField
          name="email"
          register={register}
          label={t('emailLabel')}
          placeholder="you@example.com"
          pattern={emailRegex}
          errors={errors}
          icon={<i className="fa-solid fa-envelope"></i>}
        />
        <FormField
          name="password"
          register={register}
          label={t('passwordLabel')}
          type="password"
          errors={errors}
          icon={<i className="fa-solid fa-lock"></i>}
        />
        {generalError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            {generalError}
          </div>
        )}
        {activationError && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
            <p className="text-sm">
              {t('signIn.accountNotActivated')}
            </p>

            {resendMessage !== t('checkEmail.resendSuccess') && (
              <button
                type="button"
                className="mt-3 text-primary-100 underline"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending
                  ? t('checkEmail.resending')
                  : t('checkEmail.resendButton')}
              </button>
            )}

            {resendMessage && (
              <p className="mt-2 text-sm text-gray-600">
                {resendMessage}
              </p>
            )}
          </div>
        )}
        <button type="submit" className="btn-regular w-full">
          {t('signIn.signInButton')}
        </button>
      </div>
      <span className="mt-6 text-center">
        <span>{t('signIn.noAccount')}</span>
        <Link to="/registration" className="text-center text-primary-100 ml-2">
          {t('signUpLink')}
        </Link>
      </span>
    </form>
  );
}
