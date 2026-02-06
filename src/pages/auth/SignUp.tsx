import FormError from '@components/FormError/FormError';
import Input from '@components/Input/Input';
import { emailRegex } from '@shared/regex';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './Auth.module.scss';
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
    <>
      <form className={`${styles.form} shadow-lg`} onSubmit={handleSubmit(onSubmit)}>
        <Link to="/" className="hover:text-primary-100">
          <i className="fa-solid fa-angle-left"></i>
          <span className="ml-2">{t('toHome')}</span>
        </Link>
        <h1 className="mt-4 text-center">{t('signUp.title')}</h1>
        <p className="mt-2 text-center text-gray-500">{t('signUp.subtitle')}</p>
        <div className="flex flex-col gap-4 mt-3">
          <div>
            <label htmlFor="full-name">{t('signUp.fullNameLabel')}</label>
            <Input
              id="full-name"
              placeholder={t('signUp.fullNamePlaceholder')}
              {...register('fullName', { required: true })}
              invalid={!!errors.fullName}
              icon={<i className="fa-solid fa-user"></i>}
            />
            <FormError error={errors.fullName} />
          </div>
          <div>
            <label htmlFor="full-name">{t('signUp.institutionLabel')}</label>
            <Input
              id="institution"
              placeholder={t('signUp.institutionPlaceholder')}
              {...register('institution', { required: true })}
              invalid={!!errors.institution}
              icon={<i className="fa-solid fa-building-columns"></i>}
            />
            <FormError error={errors.institution} />
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
            <label htmlFor="confirm-password">{t('signUp.confirmPasswordLabel')}</label>
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
          <button className="btn-regular w-full">{t('signUp.signUpButton')}</button>
        </div>
        <span className="mt-6 text-center">
          <span>{t('signUp.haveAccount')}</span>
          <Link to="/login" className="text-center text-primary-100 ml-2">
            {t('signInLink')}
          </Link>
        </span>
      </form>
    </>
  );
}
