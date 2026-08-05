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

  responders: (taskAssignmentId: number) =>
    [...forumRootKey, 'responders', taskAssignmentId] as const,
};
