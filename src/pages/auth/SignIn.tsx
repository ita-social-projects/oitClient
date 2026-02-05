import FormError from '@components/error/FormError';
import Input from '@components/input/Input';
import { emailRegex } from '@shared/regex';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './Auth.module.scss';
import { GoogleButton } from './GoogleButton';
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
    <div>
      <h1 className="text-center">{t('signInTitle')}</h1>
      <p className="mt-4 text-center">{t('signInSubtitle')}</p>
      <form className={`${styles.form} shadow-lg`} onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">{t('emailLabel')}</label>
          <Input
            id="email"
            placeholder="you@example.com"
            {...register('email', {
              required: true,
              pattern: emailRegex,
            })}
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
        <button className="btn-regular w-full">{t('signInButton')}</button>
        <GoogleButton />
        <Link to="/register" className="text-center text-primary-100">
          {t('noAccount')}
        </Link>
      </form>
    </div>
  );
}
