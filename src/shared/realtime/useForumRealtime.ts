import { useContext } from 'react';

import { ForumRealtimeContext } from './forumRealtimeContext';

export const useForumRealtime = () => {
  const context = useContext(ForumRealtimeContext);

  if (!context) {
    throw new Error('useForumRealtime must be used inside ForumRealtimeProvider.');
  }

  return context;
};
