import useAuth from '@shared/state/authState';
import { userService } from '@services/userService';
import { useEffect, useState } from 'react';

export function useAuthInit() {
    const hasToken = !!localStorage.getItem("accessToken");
    const [loading, setLoading] = useState(hasToken);

    useEffect(() => {
        if (!hasToken) {
            return;
        }

        userService.getProfile()
            .then((res) => useAuth.getState().login(res.data))
            .catch(() => useAuth.getState().logout())
            .finally(() => setLoading(false));
    }, [hasToken]);

    return loading;
}