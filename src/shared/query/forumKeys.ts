import type { ReviewScope } from '@shared/models/forum';

const forumRootKey = ['forum'] as const;

export const forumKeys = {
  all: forumRootKey,

  participantLists: (userId: number, taskAssignmentId: number) =>
    [...forumRootKey, 'participant', userId, taskAssignmentId] as const,

  participantList: (userId: number, taskAssignmentId: number, page: number, size: number) =>
    [...forumKeys.participantLists(userId, taskAssignmentId), page, size] as const,

  question: (userId: number, questionId: number) =>
    [...forumRootKey, 'question', userId, questionId] as const,

  questionAccessRevoked: (userId: number, questionId: number) =>
    [...forumRootKey, 'question-access-revoked', userId, questionId] as const,

  messageLists: (userId: number, questionId: number) =>
    [...forumRootKey, 'messages', userId, questionId] as const,

  pendingMessages: (userId: number, questionId: number) =>
    [...forumRootKey, 'pending-messages', userId, questionId] as const,

  messages: (userId: number, questionId: number, page: number, size: number) =>
    [...forumKeys.messageLists(userId, questionId), page, size] as const,

  adminInbox: (userId: number) => [...forumRootKey, 'admin', userId, 'inbox'] as const,

  adminAssigned: (userId: number) => [...forumRootKey, 'admin', userId, 'assigned'] as const,

  orgInbox: (userId: number) => [...forumRootKey, 'org', userId, 'inbox'] as const,

  orgAssigned: (userId: number) => [...forumRootKey, 'org', userId, 'assigned'] as const,

  reviewInboxLists: (scope: ReviewScope, userId: number) =>
    [...forumRootKey, 'review', scope, userId, 'inbox'] as const,

  reviewInbox: (
    scope: ReviewScope,
    userId: number,
    page: number,
    size: number,
  ) => [...forumKeys.reviewInboxLists(scope, userId), page, size] as const,

  reviewAssignedLists: (scope: ReviewScope, userId: number) =>
    [...forumRootKey, 'review', scope, userId, 'assigned'] as const,

  reviewAssigned: (
    scope: ReviewScope,
    userId: number,
    page: number,
    size: number,
  ) => [...forumKeys.reviewAssignedLists(scope, userId), page, size] as const,

  responders: (taskAssignmentId: number) =>
    [...forumRootKey, 'responders', taskAssignmentId] as const,
};
