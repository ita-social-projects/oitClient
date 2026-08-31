import type { BackendErrorResponse } from '@shared/models/error.ts';
import axios, { type AxiosError } from 'axios';
import { toast } from 'react-toastify';

import i18n from '../../i18n';

const API_BASE = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  (error: AxiosError<BackendErrorResponse>) => {
    const url = error.config?.url || '';
    const isAuthUrl =
      url.includes('/registration') ||
      url.includes('/user-activation') ||
      url.includes('/security/signIn');

    if (isAuthUrl) {
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error(i18n.t('api-errors.NETWORK_ERROR', { ns: 'common' }), {
        toastId: 'NETWORK_ERROR',
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    const errorCode = data?.code;
    let localizedMessage: string;

    if (errorCode && i18n.exists(`common:api-errors.${errorCode}`)) {
      localizedMessage = i18n.t(`api-errors.${errorCode}`, { ns: 'common' });
    } else {
      // Fallback mappings if the specific code isn't translated yet
      switch (status) {
        case 400:
          localizedMessage = i18n.t('api-errors.FALLBACK_400', { ns: 'common' });
          break;
        case 401:
          localizedMessage = i18n.t('api-errors.FALLBACK_401', { ns: 'common' });
          break;
        case 403:
          localizedMessage = i18n.t('api-errors.FALLBACK_403', { ns: 'common' });
          break;
        case 404:
          localizedMessage = i18n.t('api-errors.FALLBACK_404', { ns: 'common' });
          break;
        case 409:
          localizedMessage = i18n.t('api-errors.FALLBACK_409', { ns: 'common' });
          break;
        case 500:
          localizedMessage = i18n.t('api-errors.FALLBACK_500', { ns: 'common' });
          break;
        default:
          localizedMessage = i18n.t('api-errors.UNKNOWN', { ns: 'common' });
      }
    }

    toast.error(localizedMessage, { toastId: errorCode || status });

    return Promise.reject(error);
  },
);
