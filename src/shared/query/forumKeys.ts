const forumRootKey = ['forum'] as const;

export const forumKeys = {
  all: forumRootKey,

  participantList: (userId: number, taskAssignmentId: number) =>
    [...forumRootKey, 'participant', userId, taskAssignmentId] as const,

  question: (userId: number, questionId: number) =>
    [...forumRootKey, 'question', userId, questionId] as const,

  messages: (userId: number, questionId: number) =>
    [...forumRootKey, 'messages', userId, questionId] as const,

  adminInbox: (userId: number) => [...forumRootKey, 'admin', userId, 'inbox'] as const,

  adminAssigned: (userId: number) => [...forumRootKey, 'admin', userId, 'assigned'] as const,

  orgInbox: (userId: number) => [...forumRootKey, 'org', userId, 'inbox'] as const,

  orgAssigned: (userId: number) => [...forumRootKey, 'org', userId, 'assigned'] as const,

  responders: (taskAssignmentId: number) =>
    [...forumRootKey, 'responders', taskAssignmentId] as const,
};
