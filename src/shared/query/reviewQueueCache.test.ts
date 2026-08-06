import type {
  PageResponse,
  QuestionReviewInboxItemResponseDTO,
  QuestionThreadResponseDTO,
  RealtimeForumEvent,
} from '@shared/models/forum';
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { forumKeys } from './forumKeys';
import {
  applyReviewInboxRemove,
  applyReviewInboxUpsert,
  applyReviewQuestionSnapshot,
  applyReviewRealtimeEvent,
  REVIEW_PAGE_SIZE,
} from './reviewQueueCache';

const reviewItem = (
  overrides: Partial<QuestionReviewInboxItemResponseDTO> = {},
): QuestionReviewInboxItemResponseDTO => ({
  id: 10,
  taskAssignmentId: 20,
  authorId: 30,
  assignedReviewerId: null,
  title: 'Question',
  status: 'NEW',
  state: 'OPEN',
  visibility: 'PRIVATE',
  version: 1,
  createdAt: '2026-08-05T10:00:00Z',
  updatedAt: '2026-08-05T10:00:00Z',
  ...overrides,
});

const question = (
  overrides: Partial<QuestionThreadResponseDTO> = {},
): QuestionThreadResponseDTO => ({
  ...reviewItem(),
  content: 'Question content',
  ...overrides,
});

const page = (
  content: QuestionReviewInboxItemResponseDTO[],
): PageResponse<QuestionReviewInboxItemResponseDTO> => ({
  content,
  pageNumber: 0,
  pageSize: REVIEW_PAGE_SIZE,
  totalPages: content.length === 0 ? 0 : 1,
  totalElements: content.length,
  first: true,
  last: true,
});

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('reviewQueueCache', () => {
  it('appends an inbox item only to a cached last page with free space', () => {
    const client = createClient();
    const key = forumKeys.reviewInbox('admin', 1, 0, REVIEW_PAGE_SIZE);
    client.setQueryData(key, page([reviewItem({ id: 9 })]));

    expect(applyReviewInboxUpsert(client, 'admin', 1, reviewItem())).toBe(true);
    expect(client.getQueryData<PageResponse<QuestionReviewInboxItemResponseDTO>>(key))
      .toMatchObject({
        totalElements: 2,
        content: [{ id: 9 }, { id: 10 }],
      });
  });

  it('ignores an equal or stale inbox version', () => {
    const client = createClient();
    const key = forumKeys.reviewInbox('admin', 1, 0, REVIEW_PAGE_SIZE);
    const cachedPage = page([reviewItem({ version: 3 })]);
    client.setQueryData(key, cachedPage);

    expect(
      applyReviewInboxUpsert(client, 'admin', 1, reviewItem({ version: 2 })),
    ).toBe(false);
    expect(client.getQueryData(key)).toBe(cachedPage);
  });

  it('removes inbox items idempotently', () => {
    const client = createClient();
    const key = forumKeys.reviewInbox('org', 1, 0, REVIEW_PAGE_SIZE);
    client.setQueryData(key, page([reviewItem()]));
    const payload = { taskAssignmentId: 20, questionId: 10 };

    expect(applyReviewInboxRemove(client, 'org', 1, payload)).toBe(true);
    expect(applyReviewInboxRemove(client, 'org', 1, payload)).toBe(false);
  });

  it('moves a claimed question from inbox to assigned cache', () => {
    const client = createClient();
    const inboxKey = forumKeys.reviewInbox('admin', 40, 0, REVIEW_PAGE_SIZE);
    const assignedKey = forumKeys.reviewAssigned(
      'admin',
      40,
      0,
      REVIEW_PAGE_SIZE,
    );
    client.setQueryData(inboxKey, page([reviewItem()]));
    client.setQueryData(assignedKey, page([]));

    applyReviewQuestionSnapshot(
      client,
      'admin',
      40,
      question({
        assignedReviewerId: 40,
        status: 'IN_REVIEW',
        version: 2,
      }),
    );

    expect(
      client.getQueryData<PageResponse<QuestionReviewInboxItemResponseDTO>>(
        inboxKey,
      )?.content,
    ).toEqual([]);
    expect(
      client.getQueryData<PageResponse<QuestionReviewInboxItemResponseDTO>>(
        assignedKey,
      )?.content[0],
    ).toMatchObject({ id: 10, version: 2 });
  });

  it('removes a closed question from assigned cache while retaining details', () => {
    const client = createClient();
    const assignedKey = forumKeys.reviewAssigned(
      'org',
      40,
      0,
      REVIEW_PAGE_SIZE,
    );
    client.setQueryData(
      assignedKey,
      page([reviewItem({ assignedReviewerId: 40, status: 'IN_REVIEW' })]),
    );

    applyReviewQuestionSnapshot(
      client,
      'org',
      40,
      question({
        assignedReviewerId: 40,
        status: 'IN_REVIEW',
        state: 'CLOSED',
        version: 2,
      }),
    );

    expect(
      client.getQueryData<PageResponse<QuestionReviewInboxItemResponseDTO>>(
        assignedKey,
      )?.content,
    ).toEqual([]);
    expect(
      client.getQueryData<QuestionThreadResponseDTO>(
        forumKeys.question(40, 10),
      ),
    ).toMatchObject({ state: 'CLOSED', version: 2 });
  });

  it('applies REVIEW_UPDATED metadata without replacing question content', () => {
    const client = createClient();
    const assignedKey = forumKeys.reviewAssigned(
      'admin',
      40,
      0,
      REVIEW_PAGE_SIZE,
    );
    client.setQueryData(assignedKey, page([]));
    client.setQueryData(
      forumKeys.question(40, 10),
      question({
        assignedReviewerId: 40,
        status: 'IN_REVIEW',
        content: 'Keep this content',
      }),
    );
    const event: RealtimeForumEvent = {
      eventId: 'event-1',
      type: 'REVIEW_UPDATED',
      occurredAt: '2026-08-05T11:00:00Z',
      taskAssignmentId: 20,
      questionId: 10,
      payload: {
        question: reviewItem({
          assignedReviewerId: 40,
          status: 'ANSWERED',
          version: 2,
          updatedAt: '2026-08-05T11:00:00Z',
        }),
      },
    };

    applyReviewRealtimeEvent(client, 'admin', 40, event);

    expect(
      client.getQueryData<QuestionThreadResponseDTO>(
        forumKeys.question(40, 10),
      ),
    ).toMatchObject({
      content: 'Keep this content',
      status: 'ANSWERED',
      version: 2,
    });
  });

  it('ignores review events whose payload does not match the envelope', () => {
    const client = createClient();
    const key = forumKeys.reviewInbox('admin', 40, 0, REVIEW_PAGE_SIZE);
    const cachedPage = page([]);
    client.setQueryData(key, cachedPage);
    const event: RealtimeForumEvent = {
      eventId: 'invalid-1',
      type: 'INBOX_UPSERTED',
      occurredAt: '2026-08-05T11:00:00Z',
      taskAssignmentId: 20,
      questionId: 99,
      payload: { question: reviewItem({ id: 10 }) },
    };

    applyReviewRealtimeEvent(client, 'admin', 40, event);

    expect(client.getQueryData(key)).toBe(cachedPage);
  });
});
