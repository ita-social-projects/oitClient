import GoogleIcon from '@assets/google.svg';
import FormError from '@components/error/FormError';
import Input from '@components/input/Input';
import { useForm, type FieldValues } from 'react-hook-form';
import { Link } from 'react-router-dom';

import styles from './Auth.module.scss';
import { authService } from '../../shared/services/authService';

export function SignUp() {
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
      <h1 className="text-center">Create Account</h1>
      <p className="mt-4 text-center">Register to participate in IT Olympiads</p>
      <form className="shadow-lg flex flex-col gap-5 mt-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="full-name">Full Name</label>
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
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            placeholder="you@example.com"
            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
            invalid={!!errors.email}
            icon={<i className="fa-solid fa-envelope"></i>}
          />
          <FormError error={errors.email} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
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
          <label htmlFor="confirm-password">Confirm Password</label>
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
        <button className="btn-regular w-full">Sign Up</button>
        <div className="flex items-center gap-2">
          <div className={`${styles.stroke} flex-1`}></div>
          <div>Or continue with</div>
          <div className={`${styles.stroke} flex-1`}></div>
        </div>
        <button className="btn-stroked w-full flex items-center justify-center">
          <img src={GoogleIcon} alt="Google Icon" className="w-5 h-5 mr-2" />
          Continue with Google
        </button>
        <Link to="/login" className="text-center text-primary-100">
          Already have account? Sign In
        </Link>
      </form>
    </div>
  );
}
