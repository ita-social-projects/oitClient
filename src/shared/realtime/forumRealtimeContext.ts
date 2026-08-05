import type { RealtimeForumEvent } from '@shared/models/forum';
import { createContext } from 'react';

export type ForumRealtimeConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'offline'
  | 'disconnected';

export type ForumRealtimeEventListener = (event: RealtimeForumEvent) => void;
export type ForumRealtimeUnsubscribe = () => void;

export interface ForumRealtimeContextValue {
  status: ForumRealtimeConnectionStatus;
  isConnected: boolean;
  subscribe: (
    destination: string,
    listener?: ForumRealtimeEventListener,
  ) => ForumRealtimeUnsubscribe;
  addEventListener: (
    listener: ForumRealtimeEventListener,
  ) => ForumRealtimeUnsubscribe;
}

export const ForumRealtimeContext = createContext<ForumRealtimeContextValue | null>(null);
