import type { UserRole } from '@shared/models/user';

const requirePositiveId = (id: number): number => {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Realtime destination identifier must be a positive safe integer.');
  }

  return id;
};

export const forumDestinations = {
  participantQuestions: '/user/queue/questions',
  personalReviews: '/user/queue/reviews',
  administratorInbox: '/topic/admin/questions/inbox',

  taskAssignmentQuestions: (taskAssignmentId: number) =>
    `/topic/task-assignments/${requirePositiveId(taskAssignmentId)}/questions`,

  publicQuestion: (questionId: number) =>
    `/topic/questions/${requirePositiveId(questionId)}`,
} as const;

export const getFixedForumDestinations = (role: UserRole): readonly string[] => {
  const destinations: string[] = [forumDestinations.participantQuestions];

  if (role === 'ADMIN') {
    destinations.push(
      forumDestinations.administratorInbox,
      forumDestinations.personalReviews,
    );
  } else if (role === 'ORG') {
    destinations.push(forumDestinations.personalReviews);
  }

  return destinations;
};
