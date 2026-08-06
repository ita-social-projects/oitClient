import { describe, expect, it } from 'vitest';

import { forumDestinations, getFixedForumDestinations } from './forumDestinations';
import {
  buildForumWebSocketUrl,
  createForumRealtimeEventBuffer,
  getForumConnectionKind,
  isServerBackedForumQueryKey,
  parseRealtimeForumEvent,
} from './forumRealtime';

describe('forum destinations', () => {
  it('returns participant queue for every authenticated role', () => {
    expect(getFixedForumDestinations('USER')).toEqual([
      forumDestinations.participantQuestions,
    ]);
  });

  it('adds inbox and personal reviews for administrators', () => {
    expect(getFixedForumDestinations('ADMIN')).toEqual([
      forumDestinations.participantQuestions,
      forumDestinations.administratorInbox,
      forumDestinations.personalReviews,
    ]);
  });

  it('adds only personal reviews for organization members', () => {
    expect(getFixedForumDestinations('ORG')).toEqual([
      forumDestinations.participantQuestions,
      forumDestinations.personalReviews,
    ]);
  });

  it('builds resource-scoped destinations', () => {
    expect(forumDestinations.taskAssignmentQuestions(12)).toBe(
      '/topic/task-assignments/12/questions',
    );
    expect(forumDestinations.publicQuestion(34)).toBe('/topic/questions/34');
  });

  it('rejects invalid resource identifiers', () => {
    expect(() => forumDestinations.publicQuestion(0)).toThrow();
  });
});

describe('buildForumWebSocketUrl', () => {
  it('converts an HTTP API URL to the root WebSocket endpoint', () => {
    expect(
      buildForumWebSocketUrl(
        'http://localhost:8080/api/v1',
        'http://localhost:5173',
      ),
    ).toBe('ws://localhost:8080/ws');
  });

  it('uses WSS for HTTPS', () => {
    expect(
      buildForumWebSocketUrl(
        'https://example.com/api/v1/questions',
        'https://example.com',
      ),
    ).toBe('wss://example.com/ws');
  });
});

describe('parseRealtimeForumEvent', () => {
  it('parses a valid realtime event', () => {
    const event = parseRealtimeForumEvent(
      JSON.stringify({
        eventId: '10650c8f-eaa4-4ea8-bc0e-7711950f789d',
        type: 'QUESTION_REMOVED',
        occurredAt: '2026-08-06T00:00:00Z',
        taskAssignmentId: 10,
        questionId: 20,
        payload: {
          taskAssignmentId: 10,
          questionId: 20,
        },
      }),
    );

    expect(event?.type).toBe('QUESTION_REMOVED');
  });

  it('returns null for malformed JSON or an invalid envelope', () => {
    expect(parseRealtimeForumEvent('{')).toBeNull();
    expect(
      parseRealtimeForumEvent(
        JSON.stringify({
          eventId: 'event',
          type: 'UNKNOWN_EVENT',
          occurredAt: '2026-08-06T00:00:00Z',
          taskAssignmentId: 10,
          questionId: 20,
          payload: {},
        }),
      ),
    ).toBeNull();
  });
});


describe('forum reconnect reconciliation helpers', () => {
  const event = {
    eventId: '10650c8f-eaa4-4ea8-bc0e-7711950f789d',
    type: 'QUESTION_REMOVED' as const,
    occurredAt: '2026-08-06T00:00:00Z',
    taskAssignmentId: 10,
    questionId: 20,
    payload: {
      taskAssignmentId: 10,
      questionId: 20,
    },
  };

  it('distinguishes initial connection from reconnect', () => {
    expect(getForumConnectionKind(false)).toBe('initial');
    expect(getForumConnectionKind(true)).toBe('reconnect');
  });

  it('buffers events only while reconciliation is active and drains in order', () => {
    const buffer = createForumRealtimeEventBuffer();
    const secondEvent = {
      ...event,
      eventId: 'e1f27117-28fc-4cf8-a32f-c487d572c220',
      questionId: 21,
      payload: {
        taskAssignmentId: 10,
        questionId: 21,
      },
    };

    expect(buffer.capture(event)).toBe(false);

    buffer.start();

    expect(buffer.capture(event)).toBe(true);
    expect(buffer.capture(secondEvent)).toBe(true);
    expect(buffer.drain()).toEqual([event, secondEvent]);
    expect(buffer.isActive()).toBe(false);
    expect(buffer.capture(event)).toBe(false);
  });

  it('cancels buffered events when the reconnect is interrupted', () => {
    const buffer = createForumRealtimeEventBuffer();

    buffer.start();
    buffer.capture(event);
    buffer.cancel();

    expect(buffer.isActive()).toBe(false);
    expect(buffer.drain()).toEqual([]);
  });

  it('refetches server-backed forum queries but skips local cache markers', () => {
    expect(isServerBackedForumQueryKey(['forum', 'participant', 1, 10])).toBe(true);
    expect(isServerBackedForumQueryKey(['forum', 'review', 'admin', 1])).toBe(true);
    expect(isServerBackedForumQueryKey(['forum', 'responders', 10])).toBe(true);
    expect(
      isServerBackedForumQueryKey(['forum', 'question-access-revoked', 1, 20]),
    ).toBe(false);
    expect(isServerBackedForumQueryKey(['forum', 'pending-messages', 1, 20])).toBe(
      false,
    );
    expect(isServerBackedForumQueryKey(['users', 1])).toBe(false);
  });
});
