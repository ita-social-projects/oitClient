import FormError from '@components/error/FormError';
import Input from '@components/input/Input';
import { emailRegex } from '@shared/regex';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './Auth.module.scss';
import { GoogleButton } from './GoogleButton';
import { authService } from '../../shared/services/authService';

export function SignUp() {
  const { t } = useTranslation('auth');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });
  const password = watch('password');

  const onSubmit = (data: FieldValues) =>
    authService.createUser(data as { fullName: string; email: string; password: string });

  return (
    <div>
      <h1 className="text-center">{t('signUpTitle')}</h1>
      <p className="mt-4 text-center">{t('signUpSubtitle')}</p>
      <form className={`${styles.form} shadow-lg`} onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="full-name">{t('fullNameLabel')}</label>
          <Input
            id="full-name"
            placeholder="John Doe"
            {...register('fullName', { required: true })}
            invalid={!!errors.fullName}
            icon={<i className="fa-solid fa-user"></i>}
          />
          <FormError error={errors.fullName} />
        </div>
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
        <div>
          <label htmlFor="confirm-password">{t('confirmPasswordLabel')}</label>
          <Input
            id="confirm-password"
            type="password"
            {...register('confirmPassword', {
              required: true,
              minLength: 8,
              validate: value => value === password || 'Passwords do not match',
            })}
            invalid={!!errors.confirmPassword}
            icon={<i className="fa-solid fa-lock"></i>}
          />
          <FormError error={errors.confirmPassword} />
        </div>
        <button className="btn-regular w-full">{t('signUpButton')}</button>
        <GoogleButton />
        <Link to="/login" className="text-center text-primary-100">
          {t('alreadyHaveAccount')}
        </Link>
      </form>
    </div>
  );
}
