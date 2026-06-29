import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../shared/services/authService';
import styles from './Auth.module.scss';

type Status = 'loading' | 'success' | 'invalid_token' | 'already_activated';

export function VerifyEmailPage() {
    const { t } = useTranslation('auth');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';
    const called = useRef(false);

    const [status, setStatus] = useState<Status>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('invalid_token');
            return;
        }

        if (called.current) return;
        called.current = true;     

        authService.verifyEmail(token)
            .then(() => setStatus('success'))
            .catch((error: any) => {
                const httpStatus = error?.response?.status;
                if (httpStatus === 409) {
                    setStatus('already_activated');
                } else {
                    setStatus('invalid_token');
                }
            });
    }, [token]);

    if (status === 'loading') {
        return <div className={`${styles.form} shadow-lg`}>
            <p className="text-center">{t('verifyEmail.loading')}</p>
        </div>;
    }

    return (
        <div className={`${styles.form} shadow-lg`}>
            {status === 'success' && (
                <>
                    <i className="fa-solid fa-circle-check text-4xl text-green-500 text-center block" />
                    <h1 className="mt-4 text-center">{t('verifyEmail.successTitle')}</h1>
                    <p className="mt-2 text-center text-gray-500">{t('verifyEmail.successSubtitle')}</p>
                    <button className="btn-regular w-full mt-6" onClick={() => navigate('/login')}>
                        {t('toLogin')}
                    </button>
                </>
            )}
            {status === 'invalid_token' && (
                <>
                    <i className="fa-solid fa-circle-xmark text-4xl text-red-500 text-center block" />
                    <h1 className="mt-4 text-center">{t('verifyEmail.invalidTitle')}</h1>
                    <p className="mt-2 text-center text-gray-500">{t('verifyEmail.invalidSubtitle')}</p>
                    <button className="btn-regular w-full mt-6" onClick={() => navigate('/login')}>
                        {t('toLogin')}
                    </button>
                </>
            )}
            {status === 'already_activated' && (
                <>
                    <i className="fa-solid fa-circle-info text-4xl text-blue-500 text-center block" />
                    <h1 className="mt-4 text-center">{t('verifyEmail.alreadyTitle')}</h1>
                    <p className="mt-2 text-center text-gray-500">{t('verifyEmail.alreadySubtitle')}</p>
                    <button className="btn-regular w-full mt-6" onClick={() => navigate('/login')}>
                        {t('toLogin')}
                    </button>
                </>
            )}
        </div>
    );
}
