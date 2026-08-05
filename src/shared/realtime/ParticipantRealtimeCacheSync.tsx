import { applyParticipantRealtimeEvent } from '@shared/query/participantForumCache';
import type { AuthState } from '@shared/state/authState';
import useAuth from '@shared/state/authState';
import { useQueryClient } from '@tanstack/react-query';

import { useForumEventListener } from './useForumEventListener';

export const ParticipantRealtimeCacheSync = () => {
  const queryClient = useQueryClient();
  const userId = useAuth((state: AuthState) => state.user?.id);

  useForumEventListener((event) => {
    if (userId !== undefined) {
      applyParticipantRealtimeEvent(queryClient, userId, event);
    }
  });

  return null;
};
