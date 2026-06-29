import { emailRegex } from '@shared/regex';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import type { RegisterPayload } from '@shared/models/auth';

import styles from './Auth.module.scss';
import FormField from './FormField';
import { BackButton } from '../../shared/components/BackButton/BackButton';
import { authService } from '../../shared/services/authService';

export function SignUp() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });
  const password = watch('password');

  const onSubmit = async (data: FieldValues) => {
    try {
      await authService.register(data as RegisterPayload);
      navigate(`/registration/check-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 409) {
        setError('email', { message: t('signUp.emailTaken') });
      } else {
        alert(t('signUp.genericError'));
      }
    }
  };

  return (
    <form className={`${styles.form} shadow-lg`} onSubmit={handleSubmit(onSubmit)}>
      <BackButton text={t('toHome')} />
      <h1 className="mt-4 text-center">{t('signUp.title')}</h1>
      <p className="mt-2 text-center text-gray-500">{t('signUp.subtitle')}</p>
      <div className="flex flex-col gap-4 mt-3">
        <FormField
          name="firstName"
          register={register}
          label={t('signUp.firstNameLabel')}
          placeholder={t('signUp.firstNamePlaceholder')}
          errors={errors}
          icon={<i className="fa-solid fa-user"></i>}
        />
        <FormField
          name="lastName"
          register={register}
          label={t('signUp.lastNameLabel')}
          placeholder={t('signUp.lastNamePlaceholder')}
          errors={errors}
          icon={<i className="fa-solid fa-user"></i>}
        />
        <FormField
          name="middleName"
          register={register}
          label={t('signUp.middleNameLabel')}
          placeholder={t('signUp.middleNamePlaceholder')}
          errors={errors}
          icon={<i className="fa-solid fa-user"></i>}
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
          name="phoneNumber"
          register={register}
          label={t('signUp.phoneNumberLabel')}
          placeholder="+380123456789"
          errors={errors}
          icon={<i className="fa-solid fa-phone"></i>}
        />
        <FormField
          name="password"
          register={register}
          label={t('passwordLabel')}
          type="password"
          errors={errors}
          minLength={8}
          icon={<i className="fa-solid fa-lock"></i>}
        />
        <FormField
          name="confirmPassword"
          register={register}
          label={t('signUp.confirmPasswordLabel')}
          type="password"
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
  );
}
