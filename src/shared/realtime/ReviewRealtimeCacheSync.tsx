import type { ReviewScope } from '@shared/models/forum';
import { applyReviewRealtimeEvent } from '@shared/query/reviewQueueCache';
import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import { useQueryClient } from '@tanstack/react-query';

import { useForumEventListener } from './useForumEventListener';

export const ReviewRealtimeCacheSync = () => {
  const queryClient = useQueryClient();
  const user = useAuth((state: AuthState) => state.user);
  const scope: ReviewScope | null =
    user?.role === 'ADMIN'
      ? 'admin'
      : user?.role === 'ORG'
        ? 'org'
        : null;

  useForumEventListener((event) => {
    if (user && scope) {
      applyReviewRealtimeEvent(queryClient, scope, user.id, event);
    }
  });

  return null;
};
