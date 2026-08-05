import { useEffect, useRef } from 'react';

import type { ForumRealtimeEventListener } from './forumRealtimeContext';
import { useForumRealtime } from './useForumRealtime';

export const useForumEventListener = (listener: ForumRealtimeEventListener) => {
  const { addEventListener } = useForumRealtime();
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(
    () => addEventListener((event) => listenerRef.current(event)),
    [addEventListener],
  );
};
