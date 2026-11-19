import { invitationService } from '@shared/services/invitationService';
import useAuth from '@shared/state/authState';
import { useCallback, useEffect, useState } from 'react';

export const INVITATIONS_CHANGED_EVENT = 'student-invitations-changed';

export const emitInvitationsChanged = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INVITATIONS_CHANGED_EVENT));
  }
};

export interface UsePendingInvitationsCountResult {
  pendingCount: number;
  refetchPendingCount: () => Promise<void>;
}

export const usePendingInvitationsCount = (): UsePendingInvitationsCountResult => {
  const user = useAuth((state) => state.user);
  const [count, setCount] = useState<number>(0);

  const isStudent = user?.role === 'USER';
  const userId = user?.id;
  const pendingCount = isStudent && userId ? count : 0;

  const refetchPendingCount = useCallback(async (): Promise<void> => {
    if (!isStudent || !userId) {
      setCount(0);
      return;
    }

    try {
      const response = await invitationService.getUserInvitations(userId, {
        status: 'PENDING',
        page: 0,
        size: 1,
      });
      setCount(response.totalElements ?? 0);
    } catch {
      // In case of error (e.g. network/unauthorized), keep existing count or 0 silently
    }
  }, [isStudent, userId]);

  useEffect(() => {
    if (!isStudent || !userId) {
      return;
    }

    let isMounted = true;

    const fetchCount = async () => {
      try {
        const response = await invitationService.getUserInvitations(userId, {
          status: 'PENDING',
          page: 0,
          size: 1,
        });
        if (isMounted) {
          setCount(response.totalElements ?? 0);
        }
      } catch {
        // In case of error, keep existing count silently
      }
    };

    void fetchCount();

    const handleInvitationsChanged = () => {
      void fetchCount();
    };

    window.addEventListener(INVITATIONS_CHANGED_EVENT, handleInvitationsChanged);
    return () => {
      isMounted = false;
      window.removeEventListener(INVITATIONS_CHANGED_EVENT, handleInvitationsChanged);
    };
  }, [isStudent, userId]);

  return {
    pendingCount,
    refetchPendingCount,
  };
};
