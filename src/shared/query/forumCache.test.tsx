import type {
  QuestionMessageResponseDTO,
  QuestionReviewInboxItemResponseDTO,
  QuestionThreadResponseDTO,
} from '@shared/models/forum';
import { describe, expect, it } from 'vitest';

import {
  appendMessage,
  removeInboxItem,
  removeQuestion,
  removeReviewItem,
  upsertInboxItem,
  upsertQuestion,
  upsertReviewItem,
  type QuestionCacheItem,
} from './forumCache';

const question = (
  overrides: Partial<QuestionThreadResponseDTO> = {},
): QuestionThreadResponseDTO => ({
  id: 10,
  taskAssignmentId: 20,
  authorId: 30,
  assignedReviewerId: null,
  title: 'Question',
  content: 'Question content',
  status: 'NEW',
  visibility: 'PRIVATE',
  state: 'OPEN',
  version: 1,
  createdAt: '2026-08-05T10:00:00Z',
  updatedAt: '2026-08-05T10:00:00Z',
  ...overrides,
});

const questionCacheItem = (
  overrides: Partial<QuestionCacheItem> = {},
): QuestionCacheItem => ({
  id: 10,
  taskAssignmentId: 20,
  authorId: 30,
  title: 'Question',
  status: 'NEW',
  visibility: 'PRIVATE',
  state: 'OPEN',
  createdAt: '2026-08-05T10:00:00Z',
  updatedAt: '2026-08-05T10:00:00Z',
  version: 1,
  ...overrides,
});

const reviewItem = (
  overrides: Partial<QuestionReviewInboxItemResponseDTO> = {},
): QuestionReviewInboxItemResponseDTO => ({
  id: 10,
  taskAssignmentId: 20,
  authorId: 30,
  assignedReviewerId: 40,
  title: 'Question',
  status: 'IN_REVIEW',
  state: 'OPEN',
  visibility: 'PRIVATE',
  version: 1,
  createdAt: '2026-08-05T10:00:00Z',
  updatedAt: '2026-08-05T10:00:00Z',
  ...overrides,
});

const message = (
  overrides: Partial<QuestionMessageResponseDTO> = {},
): QuestionMessageResponseDTO => ({
  id: 100,
  questionThreadId: 10,
  authorId: 30,
  type: 'COMMENT',
  content: 'Message',
  createdAt: '2026-08-05T10:00:00Z',
  ...overrides,
});

describe('forumCache', () => {
  describe('upsertQuestion', () => {
    it('prepends a new question', () => {
      const existing = questionCacheItem({ id: 9 });
      const result = upsertQuestion([existing], question());

      expect(result.map((item) => item.id)).toEqual([10, 9]);
      expect(result[0].version).toBe(1);
    });

    it('replaces an unversioned REST summary with a versioned snapshot', () => {
      const existing = questionCacheItem({ version: undefined });
      const result = upsertQuestion([existing], question({ version: 3, title: 'Updated' }));

      expect(result[0]).toMatchObject({ title: 'Updated', version: 3 });
    });

    it('replaces an existing question only with a newer version', () => {
      const existing = questionCacheItem({ version: 2 });
      const result = upsertQuestion([existing], question({ version: 3, title: 'Updated' }));

      expect(result[0]).toMatchObject({ title: 'Updated', version: 3 });
    });

    it('ignores equal and stale versions without changing the array reference', () => {
      const existing = [questionCacheItem({ version: 3 })];

      expect(upsertQuestion(existing, question({ version: 3 }))).toBe(existing);
      expect(upsertQuestion(existing, question({ version: 2 }))).toBe(existing);
    });
  });

  describe('removeQuestion', () => {
    it('removes a matching question', () => {
      expect(removeQuestion([questionCacheItem()], 10)).toEqual([]);
    });

    it('is idempotent when the question is absent', () => {
      const existing = [questionCacheItem()];

      expect(removeQuestion(existing, 99)).toBe(existing);
    });
  });

  describe('appendMessage', () => {
    it('appends a new message', () => {
      const existing = message({ id: 99 });
      const result = appendMessage([existing], message());

      expect(result.map((item) => item.id)).toEqual([99, 100]);
    });

    it('deduplicates by message id without changing the array reference', () => {
      const existing = [message()];

      expect(appendMessage(existing, message({ content: 'Duplicate delivery' }))).toBe(existing);
    });
  });

  describe('inbox cache', () => {
    it('appends a new oldest-first inbox item', () => {
      const result = upsertInboxItem([reviewItem({ id: 9 })], reviewItem());

      expect(result.map((item) => item.id)).toEqual([9, 10]);
    });

    it('replaces a newer item in place and ignores stale versions', () => {
      const existing = [reviewItem({ id: 9 }), reviewItem({ version: 2 })];
      const updated = upsertInboxItem(existing, reviewItem({ version: 3, title: 'Updated' }));

      expect(updated.map((item) => item.id)).toEqual([9, 10]);
      expect(updated[1]).toMatchObject({ title: 'Updated', version: 3 });
      expect(upsertInboxItem(updated, reviewItem({ version: 2 }))).toBe(updated);
    });

    it('removes idempotently', () => {
      const existing = [reviewItem()];

      expect(removeInboxItem(existing, 10)).toEqual([]);
      expect(removeInboxItem(existing, 99)).toBe(existing);
    });
  });

  describe('review cache', () => {
    it('prepends a new review item', () => {
      const result = upsertReviewItem([reviewItem({ id: 9 })], reviewItem());

      expect(result.map((item) => item.id)).toEqual([10, 9]);
    });

    it('moves a newer review item to the start', () => {
      const existing = [reviewItem({ id: 9 }), reviewItem({ version: 2 })];
      const result = upsertReviewItem(existing, reviewItem({ version: 3, title: 'Updated' }));

      expect(result.map((item) => item.id)).toEqual([10, 9]);
      expect(result[0]).toMatchObject({ title: 'Updated', version: 3 });
    });

    it('ignores stale reviews and removes idempotently', () => {
      const existing = [reviewItem({ version: 3 })];

      expect(upsertReviewItem(existing, reviewItem({ version: 2 }))).toBe(existing);
      expect(removeReviewItem(existing, 10)).toEqual([]);
      expect(removeReviewItem(existing, 99)).toBe(existing);
    });
  });
});
