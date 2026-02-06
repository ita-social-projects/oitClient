import { emailRegex } from '@shared/regex';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './Auth.module.scss';
import FormField from './FormField';
import { authService } from '../../shared/services/authService';
import { BackButton } from './BackButton';

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
        <BackButton />
        <h1 className="mt-4 text-center">{t('signUp.title')}</h1>
        <p className="mt-2 text-center text-gray-500">{t('signUp.subtitle')}</p>
        <div className="flex flex-col gap-4 mt-3">
          <FormField
            name="fullName"
            register={register}
            label={t('signUp.fullNameLabel')}
            placeholder={t('signUp.fullNamePlaceholder')}
            errors={errors}
            icon={<i className="fa-solid fa-user"></i>}
          />
          <FormField
            name="institution"
            register={register}
            label={t('signUp.institutionLabel')}
            placeholder={t('signUp.institutionPlaceholder')}
            errors={errors}
            icon={<i className="fa-solid fa-building-columns"></i>}
          />
          <FormField
            name="email"
            register={register}
            label={t('emailLabel')}
            pattern={emailRegex}
            placeholder="you@example.com"
            errors={errors}
            icon={<i className="fa-solid fa-envelope"></i>}
          />
          <FormField
            name="password"
            register={register}
            label={t('passwordLabel')}
            errors={errors}
            minLength={8}
            icon={<i className="fa-solid fa-lock"></i>}
          />
          <FormField
            name="confirmPassword"
            register={register}
            label={t('signUp.confirmPasswordLabel')}
            errors={errors}
            minLength={8}
            passwordConfirm={password}
            icon={<i className="fa-solid fa-lock"></i>}
          />
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
