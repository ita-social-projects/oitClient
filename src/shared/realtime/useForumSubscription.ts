import { useEffect, useRef } from 'react';

import type { ForumRealtimeEventListener } from './forumRealtimeContext';
import { useForumRealtime } from './useForumRealtime';

export const useForumSubscription = (
  destination: string | null,
  listener?: ForumRealtimeEventListener,
) => {
  const { status, subscribe } = useForumRealtime();
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!destination || status !== 'connected') {
      return undefined;
    }

    return subscribe(destination, (event) => {
      listenerRef.current?.(event);
    });
  }, [destination, status, subscribe]);
};
