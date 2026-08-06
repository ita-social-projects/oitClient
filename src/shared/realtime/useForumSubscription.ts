import { useEffect, useRef } from 'react';

import type { ForumRealtimeEventListener } from './forumRealtimeContext';
import { useForumRealtime } from './useForumRealtime';

export const useForumSubscription = (
  destination: string | null,
  listener?: ForumRealtimeEventListener,
) => {
  const { subscribe } = useForumRealtime();
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!destination) {
      return undefined;
    }

    return subscribe(destination, (event) => {
      listenerRef.current?.(event);
    });
  }, [destination, subscribe]);
};
