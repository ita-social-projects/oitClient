import FormError from '@components/FormError';
import Input from '@components/Input';
import type { InputHTMLAttributes } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'pattern'> & {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  pattern?: RegExp;
  passwordConfirm?: any;
};

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  register,
  errors,
  icon,
  iconEnd,
  pattern,
  passwordConfirm,
  ...rest
}) => {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <Input
        id={name}
        className="w-full!"
        {...rest}
        {...register(name, {
          required: true,
          pattern,
          minLength: rest.minLength,
          validate: value => {
            if (passwordConfirm) return value === passwordConfirm || 'Passwords do not match';
          },
        })}
        invalid={!!errors[name]}
        icon={icon}
        iconEnd={iconEnd}
      />
      <FormError error={errors[name]} />
    </div>
  );
};

export default FormField;
