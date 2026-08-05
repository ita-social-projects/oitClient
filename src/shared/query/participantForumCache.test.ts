import type {
  PageResponse,
  QuestionMessageResponseDTO,
  QuestionThreadResponseDTO,
  RealtimeForumEvent,
} from '@shared/models/forum';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';

import type { QuestionCacheItem } from './forumCache';
import { forumKeys } from './forumKeys';
import {
  applyParticipantAccessRevoked,
  applyParticipantMessageCreated,
  applyParticipantQuestionUpsert,
  applyParticipantRealtimeEvent,
  mergePendingParticipantMessages,
} from './participantForumCache';

const USER_ID = 7;
const TASK_ASSIGNMENT_ID = 20;
const QUESTION_ID = 10;

const question = (
  overrides: Partial<QuestionThreadResponseDTO> = {},
): QuestionThreadResponseDTO => ({
  id: QUESTION_ID,
  taskAssignmentId: TASK_ASSIGNMENT_ID,
  authorId: 30,
  assignedReviewerId: null,
  title: 'Question',
  content: 'Question content',
  status: 'NEW',
  visibility: 'PUBLIC',
  state: 'OPEN',
  version: 1,
  createdAt: '2026-08-06T10:00:00Z',
  updatedAt: '2026-08-06T10:00:00Z',
  ...overrides,
});

const questionItem = (
  overrides: Partial<QuestionCacheItem> = {},
): QuestionCacheItem => ({
  id: QUESTION_ID,
  taskAssignmentId: TASK_ASSIGNMENT_ID,
  authorId: 30,
  title: 'Question',
  status: 'NEW',
  visibility: 'PUBLIC',
  state: 'OPEN',
  version: 1,
  createdAt: '2026-08-06T10:00:00Z',
  updatedAt: '2026-08-06T10:00:00Z',
  ...overrides,
});

const message = (
  overrides: Partial<QuestionMessageResponseDTO> = {},
): QuestionMessageResponseDTO => ({
  id: 100,
  questionThreadId: QUESTION_ID,
  authorId: 30,
  type: 'COMMENT',
  content: 'Message',
  createdAt: '2026-08-06T10:05:00Z',
  ...overrides,
});

const page = <T>(
  content: T[],
  overrides: Partial<PageResponse<T>> = {},
): PageResponse<T> => ({
  content,
  pageNumber: 0,
  pageSize: 20,
  totalPages: content.length === 0 ? 0 : 1,
  totalElements: content.length,
  first: true,
  last: true,
  ...overrides,
});

const realtimeEvent = (
  overrides: Partial<RealtimeForumEvent> = {},
): RealtimeForumEvent => ({
  eventId: 'event-1',
  type: 'QUESTION_UPSERTED',
  occurredAt: '2026-08-06T10:05:00Z',
  taskAssignmentId: TASK_ASSIGNMENT_ID,
  questionId: QUESTION_ID,
  payload: { question: question() },
  ...overrides,
} as RealtimeForumEvent);

describe('participantForumCache', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('adds a new question to the first forum page and detail cache', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 20);
    queryClient.setQueryData(
      listKey,
      page([questionItem({ id: 9, createdAt: '2026-08-05T10:00:00Z' })]),
    );

    expect(applyParticipantQuestionUpsert(queryClient, USER_ID, question())).toBe(true);

    const list = queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey);

    expect(list?.content.map((item) => item.id)).toEqual([QUESTION_ID, 9]);
    expect(list?.totalElements).toBe(2);
    expect(
      queryClient.getQueryData(forumKeys.question(USER_ID, QUESTION_ID)),
    ).toEqual(question());
  });

  it('fills a list that completed after the same snapshot was cached as detail', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 20);
    const snapshot = question();

    queryClient.setQueryData(
      forumKeys.question(USER_ID, QUESTION_ID),
      snapshot,
    );
    queryClient.setQueryData(listKey, page<QuestionCacheItem>([]));

    expect(
      applyParticipantQuestionUpsert(queryClient, USER_ID, snapshot),
    ).toBe(true);
    expect(
      queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey)?.content[0]
        ?.id,
    ).toBe(QUESTION_ID);
  });

  it('updates question visibility, status and state only for a newer version', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 20);
    const initialQuestion = question({ version: 2 });
    const updatedQuestion = question({
      version: 3,
      visibility: 'PRIVATE',
      status: 'ANSWERED',
      state: 'CLOSED',
    });

    queryClient.setQueryData(listKey, page([questionItem({ version: 2 })]));
    queryClient.setQueryData(
      forumKeys.question(USER_ID, QUESTION_ID),
      initialQuestion,
    );

    expect(
      applyParticipantQuestionUpsert(queryClient, USER_ID, updatedQuestion),
    ).toBe(true);
    expect(
      applyParticipantQuestionUpsert(
        queryClient,
        USER_ID,
        question({ version: 2 }),
      ),
    ).toBe(false);

    const list = queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey);
    const detail = queryClient.getQueryData<QuestionThreadResponseDTO>(
      forumKeys.question(USER_ID, QUESTION_ID),
    );

    expect(list?.content[0]).toMatchObject({
      visibility: 'PRIVATE',
      status: 'ANSWERED',
      state: 'CLOSED',
      version: 3,
    });
    expect(detail).toEqual(updatedQuestion);
  });

  it('does not move an older uncached question onto a full first page', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 1);
    queryClient.setQueryData(
      listKey,
      page(
        [questionItem({ id: 9, createdAt: '2026-08-06T12:00:00Z' })],
        { pageSize: 1 },
      ),
    );

    applyParticipantQuestionUpsert(
      queryClient,
      USER_ID,
      question({ createdAt: '2026-08-05T10:00:00Z' }),
    );

    const list = queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey);

    expect(list?.content.map((item) => item.id)).toEqual([9]);
    expect(list?.totalElements).toBe(1);
  });

  it('removes a revoked question once and records the access marker', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 20);
    const payload = {
      taskAssignmentId: TASK_ASSIGNMENT_ID,
      questionId: QUESTION_ID,
    };

    queryClient.setQueryData(listKey, page([questionItem()]));
    queryClient.setQueryData(
      forumKeys.question(USER_ID, QUESTION_ID),
      question(),
    );

    expect(applyParticipantAccessRevoked(queryClient, USER_ID, payload)).toBe(true);
    expect(applyParticipantAccessRevoked(queryClient, USER_ID, payload)).toBe(false);

    const list = queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey);

    expect(list?.content).toEqual([]);
    expect(list?.totalElements).toBe(0);
    expect(
      queryClient.getQueryData(
        forumKeys.questionAccessRevoked(USER_ID, QUESTION_ID),
      ),
    ).toEqual(payload);
  });

  it('restores access from a newer accessible question snapshot', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 20);
    const payload = {
      taskAssignmentId: TASK_ASSIGNMENT_ID,
      questionId: QUESTION_ID,
    };

    queryClient.setQueryData(listKey, page([questionItem()]));
    queryClient.setQueryData(
      forumKeys.question(USER_ID, QUESTION_ID),
      question(),
    );
    applyParticipantAccessRevoked(queryClient, USER_ID, payload);

    expect(
      applyParticipantQuestionUpsert(
        queryClient,
        USER_ID,
        question({ version: 2 }),
      ),
    ).toBe(true);
    expect(
      queryClient.getQueryData(
        forumKeys.questionAccessRevoked(USER_ID, QUESTION_ID),
      ),
    ).toBe(null);
    expect(
      queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey)?.content[0]
        ?.id,
    ).toBe(QUESTION_ID);
  });

  it('does not revoke the author access to their own private question', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 20);
    const ownQuestion = questionItem({ authorId: USER_ID });

    queryClient.setQueryData(listKey, page([ownQuestion]));

    expect(
      applyParticipantAccessRevoked(queryClient, USER_ID, {
        taskAssignmentId: TASK_ASSIGNMENT_ID,
        questionId: QUESTION_ID,
      }),
    ).toBe(false);
    expect(
      queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey)?.content,
    ).toEqual([ownQuestion]);
  });

  it('buffers a message until the last REST page is available', () => {
    const pendingMessage = message();

    expect(
      applyParticipantMessageCreated(queryClient, USER_ID, pendingMessage),
    ).toBe(null);
    expect(
      queryClient.getQueryData<QuestionMessageResponseDTO[]>(
        forumKeys.pendingMessages(USER_ID, QUESTION_ID),
      ),
    ).toEqual([pendingMessage]);

    const mergedPage = mergePendingParticipantMessages(
      queryClient,
      USER_ID,
      QUESTION_ID,
      page<QuestionMessageResponseDTO>([]),
    );

    expect(mergedPage.content).toEqual([pendingMessage]);
    expect(mergedPage.totalElements).toBe(1);
    expect(
      queryClient.getQueryData<QuestionMessageResponseDTO[]>(
        forumKeys.pendingMessages(USER_ID, QUESTION_ID),
      ),
    ).toEqual([]);
  });

  it('appends a message once to the loaded last page', () => {
    const messageKey = forumKeys.messages(USER_ID, QUESTION_ID, 0, 50);
    queryClient.setQueryData(messageKey, page([message({ id: 99 })], { pageSize: 50 }));

    expect(applyParticipantMessageCreated(queryClient, USER_ID, message())).toBe(0);
    expect(
      applyParticipantMessageCreated(
        queryClient,
        USER_ID,
        message({ content: 'Duplicate delivery' }),
      ),
    ).toBe(0);

    const messages = queryClient.getQueryData<
      PageResponse<QuestionMessageResponseDTO>
    >(messageKey);

    expect(messages?.content.map((item) => item.id)).toEqual([99, 100]);
    expect(messages?.totalElements).toBe(2);
  });

  it('creates the next cached page when the loaded last page is full', () => {
    const firstPageKey = forumKeys.messages(USER_ID, QUESTION_ID, 0, 2);
    queryClient.setQueryData(
      firstPageKey,
      page([message({ id: 98 }), message({ id: 99 })], { pageSize: 2 }),
    );

    expect(applyParticipantMessageCreated(queryClient, USER_ID, message())).toBe(1);

    const firstPage = queryClient.getQueryData<
      PageResponse<QuestionMessageResponseDTO>
    >(firstPageKey);
    const secondPage = queryClient.getQueryData<
      PageResponse<QuestionMessageResponseDTO>
    >(forumKeys.messages(USER_ID, QUESTION_ID, 1, 2));

    expect(firstPage).toMatchObject({
      totalElements: 3,
      totalPages: 2,
      last: false,
    });
    expect(secondPage?.content).toEqual([message()]);
  });

  it('applies only participant event types with matching envelope identifiers', () => {
    const listKey = forumKeys.participantList(USER_ID, TASK_ASSIGNMENT_ID, 0, 20);
    queryClient.setQueryData(listKey, page<QuestionCacheItem>([]));

    applyParticipantRealtimeEvent(
      queryClient,
      USER_ID,
      realtimeEvent({ questionId: 999 }),
    );

    expect(
      queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey)?.content,
    ).toEqual([]);

    applyParticipantRealtimeEvent(queryClient, USER_ID, realtimeEvent());

    expect(
      queryClient.getQueryData<PageResponse<QuestionCacheItem>>(listKey)?.content[0]
        ?.id,
    ).toBe(QUESTION_ID);
  });
});
