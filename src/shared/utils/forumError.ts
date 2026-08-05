import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  status?: number;
  code?: string;
}

export const getForumErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return undefined;
  }

  return error.response?.status ?? error.response?.data?.status;
};

export const getForumErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  return error.response?.data?.message || fallback;
};

export const retryForumQuery = (failureCount: number, error: unknown): boolean => {
  const status = getForumErrorStatus(error);

  if (status !== undefined && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < 1;
};

export const parsePositiveRouteId = (value: string | undefined): number | null => {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};
