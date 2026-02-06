import FormError from '@components/FormError/FormError';
import Input from '@components/Input/Input';
import { emailRegex } from '@shared/regex';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './Auth.module.scss';
import { authService } from '../../shared/services/authService';

export function SignIn() {
  const { t } = useTranslation('auth');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const onSubmit = (data: FieldValues) =>
    authService.login(data as { email: string; password: string });

  return (
    <>
      <form className={`${styles.form} shadow-lg`} onSubmit={handleSubmit(onSubmit)}>
        <Link to="/" className="hover:text-primary-100">
          <i className="fa-solid fa-angle-left"></i>
          <span className="ml-2">{t('toHome')}</span>
        </Link>
        <h1 className="mt-4 text-center">{t('signIn.title')}</h1>
        <p className="mt-2 text-center text-gray-500">{t('signIn.subtitle')}</p>
        <div className="flex flex-col gap-4 mt-3">
          <div>
            <label htmlFor="email">{t('emailLabel')}</label>
            <Input
              id="email"
              placeholder="you@example.com"
              {...register('email', { required: true, pattern: emailRegex })}
              invalid={!!errors.email}
              icon={<i className="fa-solid fa-envelope"></i>}
            />
            <FormError error={errors.email} />
          </div>
          <div>
            <label htmlFor="password">{t('passwordLabel')}</label>
            <Input
              id="password"
              type="password"
              {...register('password', { required: true, minLength: 8 })}
              invalid={!!errors.password}
              icon={<i className="fa-solid fa-lock"></i>}
            />
            <FormError error={errors.password} />
          </div>
          <button className="btn-regular w-full">{t('signIn.signInButton')}</button>
        </div>
        <span className="mt-6 text-center">
          <span>{t('signIn.noAccount')}</span>
          <Link to="/register" className="text-center text-primary-100 ml-2">
            {t('signUpLink')}
          </Link>
        </span>
      </form>
    </>
  );
}
