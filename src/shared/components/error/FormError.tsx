import type { FieldError } from 'react-hook-form';

const ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  minLength: 'The input is too short',
};

export interface ErrorProps {
  error?: Partial<FieldError>;
}

export default function FormError({ error }: ErrorProps) {
  const getErrorMessage = (error: FieldError) =>
    error.message || ERROR_MESSAGES[error.type] || 'Error message';

  return error ? (
    <small className="text-red-500">{getErrorMessage(error as FieldError)}</small>
  ) : null;
}
