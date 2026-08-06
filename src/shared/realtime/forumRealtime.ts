import {
  RealtimeEventType,
  type RealtimeForumEvent,
  type RealtimeEventType as RealtimeEventTypeValue,
} from '@shared/models/forum';

const REALTIME_EVENT_TYPES = new Set<RealtimeEventTypeValue>(
  Object.values(RealtimeEventType),
);

const LOCAL_ONLY_FORUM_QUERY_SEGMENTS = new Set([
  'question-access-revoked',
  'pending-messages',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isRealtimeEventType = (value: unknown): value is RealtimeEventTypeValue =>
  typeof value === 'string' &&
  REALTIME_EVENT_TYPES.has(value as RealtimeEventTypeValue);

export type ForumConnectionKind = 'initial' | 'reconnect';

export interface ForumRealtimeEventBuffer {
  start: () => void;
  capture: (event: RealtimeForumEvent) => boolean;
  drain: () => RealtimeForumEvent[];
  cancel: () => void;
  isActive: () => boolean;
}

export const getForumConnectionKind = (
  hasConnectedBefore: boolean,
): ForumConnectionKind => (hasConnectedBefore ? 'reconnect' : 'initial');

export const createForumRealtimeEventBuffer = (): ForumRealtimeEventBuffer => {
  let active = false;
  let events: RealtimeForumEvent[] = [];

  return {
    start: () => {
      active = true;
      events = [];
    },
    capture: (event) => {
      if (!active) {
        return false;
      }

      events.push(event);
      return true;
    },
    drain: () => {
      const bufferedEvents = events;
      events = [];
      active = false;
      return bufferedEvents;
    },
    cancel: () => {
      events = [];
      active = false;
    },
    isActive: () => active,
  };
};

export const isServerBackedForumQueryKey = (
  queryKey: readonly unknown[],
): boolean =>
  queryKey[0] === 'forum' &&
  typeof queryKey[1] === 'string' &&
  !LOCAL_ONLY_FORUM_QUERY_SEGMENTS.has(queryKey[1]);

export const parseRealtimeForumEvent = (body: string): RealtimeForumEvent | null => {
  try {
    const parsed: unknown = JSON.parse(body);

    if (
      !isRecord(parsed) ||
      typeof parsed.eventId !== 'string' ||
      parsed.eventId.length === 0 ||
      !isRealtimeEventType(parsed.type) ||
      typeof parsed.occurredAt !== 'string' ||
      parsed.occurredAt.length === 0 ||
      !isPositiveSafeInteger(parsed.taskAssignmentId) ||
      !isPositiveSafeInteger(parsed.questionId) ||
      !isRecord(parsed.payload)
    ) {
      return null;
    }

    return parsed as unknown as RealtimeForumEvent;
  } catch {
    return null;
  }
};

export const buildForumWebSocketUrl = (
  apiUrl: string | undefined,
  browserOrigin: string,
): string => {
  const url = new URL(apiUrl || browserOrigin, browserOrigin);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Forum WebSocket URL requires an HTTP or HTTPS base URL.');
  }

  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = '';
  url.hash = '';

  return url.toString();
};
