import { emailRegex } from '@shared/regex';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import styles from './Auth.module.scss';
import { BackButton } from './BackButton';
import FormField from './FormField';
import { authService } from '../../shared/services/authService';

export function SignIn() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const onSubmit = (data: FieldValues) => {
    authService
      .login(data as { email: string; password: string })
      .then(response => {
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('accessToken', response.data.accessToken);
        navigate('/profile');
      })
      .catch(() => {
        alert(t('signIn.invalidCredentials'));
      });
  };

  return (
    <form className={`${styles.form} shadow-lg`} onSubmit={handleSubmit(onSubmit)}>
      <BackButton />
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
        <button className="btn-regular w-full">{t('signIn.signInButton')}</button>
      </div>
      <span className="mt-6 text-center">
        <span>{t('signIn.noAccount')}</span>
        <Link to="/register" className="text-center text-primary-100 ml-2">
          {t('signUpLink')}
        </Link>
      </span>
    </form>
  );
}
