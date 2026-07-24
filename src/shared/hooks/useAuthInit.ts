import { useEffect, useState } from 'react';
import useAuth from '@shared/state/authState';
import { userService } from '@services/userService';

export function useAuthInit() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }

        userService.getProfile()
            .then((res) => useAuth.getState().login(res.data))
            .catch(() => useAuth.getState().logout())
            .finally(() => setLoading(false));
    }, []);

    return loading;
}