import type {
  InboxRemovalPayload,
  PageResponse,
  QuestionReviewInboxItemResponseDTO,
  QuestionThreadResponseDTO,
  RealtimeForumEvent,
  ReviewScope,
} from '@shared/models/forum';
import {
  removeInboxItem,
  removeReviewItem,
  upsertInboxItem,
  upsertReviewItem,
} from '@shared/query/forumCache';
import { forumKeys } from '@shared/query/forumKeys';
import type { QueryClient, QueryKey } from '@tanstack/react-query';

export const REVIEW_PAGE_SIZE = 20;

type ReviewPage = PageResponse<QuestionReviewInboxItemResponseDTO>;
type CachedReviewPage = [QueryKey, ReviewPage | undefined];

const getPages = (
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): CachedReviewPage[] => queryClient.getQueriesData<ReviewPage>({ queryKey });

const withTotalElements = (page: ReviewPage, totalElements: number): ReviewPage => {
  const safeTotalElements = Math.max(0, totalElements);
  const totalPages = safeTotalElements === 0
    ? 0
    : Math.ceil(safeTotalElements / page.pageSize);

  return {
    ...page,
    totalElements: safeTotalElements,
    totalPages,
    first: page.pageNumber === 0,
    last: totalPages === 0 || page.pageNumber >= totalPages - 1,
  };
};

const toReviewItem = (
  question: QuestionThreadResponseDTO,
): QuestionReviewInboxItemResponseDTO => ({
  id: question.id,
  taskAssignmentId: question.taskAssignmentId,
  authorId: question.authorId,
  assignedReviewerId: question.assignedReviewerId,
  title: question.title,
  status: question.status,
  state: question.state,
  visibility: question.visibility,
  version: question.version,
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
});

const updateQuestionDetailsFromSummary = (
  queryClient: QueryClient,
  userId: number,
  item: QuestionReviewInboxItemResponseDTO,
) => {
  queryClient.setQueryData<QuestionThreadResponseDTO>(
    forumKeys.question(userId, item.id),
    (current) => {
      if (!current || item.version <= current.version) {
        return current;
      }

      return {
        ...current,
        assignedReviewerId: item.assignedReviewerId,
        status: item.status,
        state: item.state,
        visibility: item.visibility,
        version: item.version,
        updatedAt: item.updatedAt,
      };
    },
  );
};

export const applyReviewInboxUpsert = (
  queryClient: QueryClient,
  scope: ReviewScope,
  userId: number,
  item: QuestionReviewInboxItemResponseDTO,
): boolean => {
  const pages = getPages(
    queryClient,
    forumKeys.reviewInboxLists(scope, userId),
  );
  const existingPage = pages.find(([, page]) =>
    page?.content.some((current) => current.id === item.id),
  );

  if (existingPage) {
    const [queryKey, page] = existingPage;

    if (!page) {
      return false;
    }

    const content = upsertInboxItem(page.content, item);

    if (content === page.content) {
      return false;
    }

    queryClient.setQueryData(queryKey, { ...page, content });
    return true;
  }

  const insertionPage = pages.find(([, page]) =>
    page?.last && page.content.length < page.pageSize,
  );

  if (!insertionPage?.[1]) {
    return false;
  }

  const [insertionKey] = insertionPage;

  pages.forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    queryClient.setQueryData(
      queryKey,
      queryKey === insertionKey
        ? {
            ...withTotalElements(page, page.totalElements + 1),
            content: upsertInboxItem(page.content, item),
          }
        : withTotalElements(page, page.totalElements + 1),
    );
  });

  return true;
};

export const applyReviewInboxRemove = (
  queryClient: QueryClient,
  scope: ReviewScope,
  userId: number,
  payload: InboxRemovalPayload,
): boolean => {
  const pages = getPages(
    queryClient,
    forumKeys.reviewInboxLists(scope, userId),
  );
  const containsItem = pages.some(([, page]) =>
    page?.content.some((item) => item.id === payload.questionId),
  );

  if (!containsItem) {
    return false;
  }

  pages.forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    queryClient.setQueryData(queryKey, {
      ...withTotalElements(page, page.totalElements - 1),
      content: removeInboxItem(page.content, payload.questionId),
    });
  });

  return true;
};

export const applyReviewAssignedRemove = (
  queryClient: QueryClient,
  scope: ReviewScope,
  userId: number,
  questionId: number,
): boolean => {
  const pages = getPages(
    queryClient,
    forumKeys.reviewAssignedLists(scope, userId),
  );
  const containsItem = pages.some(([, page]) =>
    page?.content.some((item) => item.id === questionId),
  );

  if (!containsItem) {
    return false;
  }

  pages.forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    queryClient.setQueryData(queryKey, {
      ...withTotalElements(page, page.totalElements - 1),
      content: removeReviewItem(page.content, questionId),
    });
  });

  return true;
};

export const applyReviewAssignedUpsert = (
  queryClient: QueryClient,
  scope: ReviewScope,
  userId: number,
  item: QuestionReviewInboxItemResponseDTO,
): boolean => {
  if (item.state === 'CLOSED' || item.assignedReviewerId !== userId) {
    return applyReviewAssignedRemove(queryClient, scope, userId, item.id);
  }

  const pages = getPages(
    queryClient,
    forumKeys.reviewAssignedLists(scope, userId),
  );
  const firstPage = pages.find(([, page]) => page?.pageNumber === 0);

  if (!firstPage?.[1]) {
    return false;
  }

  const existingItem = pages
    .flatMap(([, page]) => page?.content ?? [])
    .find((current) => current.id === item.id);
  const alreadyCached = existingItem !== undefined;

  if (existingItem && item.version <= existingItem.version) {
    return false;
  }

  pages.forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    const withoutItem = removeReviewItem(page.content, item.id);

    if (page.pageNumber === 0) {
      const content = upsertReviewItem(withoutItem, item).slice(0, page.pageSize);
      queryClient.setQueryData(
        queryKey,
        alreadyCached
          ? { ...page, content }
          : {
              ...withTotalElements(page, page.totalElements + 1),
              content,
            },
      );
      return;
    }

    queryClient.setQueryData(
      queryKey,
      alreadyCached
        ? { ...page, content: withoutItem }
        : withTotalElements(page, page.totalElements + 1),
    );
  });

  return true;
};

export const applyReviewQuestionSnapshot = (
  queryClient: QueryClient,
  scope: ReviewScope,
  userId: number,
  question: QuestionThreadResponseDTO,
): void => {
  const current = queryClient.getQueryData<QuestionThreadResponseDTO>(
    forumKeys.question(userId, question.id),
  );

  if (!current || question.version > current.version) {
    queryClient.setQueryData(
      forumKeys.question(userId, question.id),
      question,
    );
  }

  const item = toReviewItem(question);
  const inboxEligible =
    item.state === 'OPEN' &&
    item.status === 'NEW' &&
    item.assignedReviewerId === null;

  if (inboxEligible) {
    applyReviewInboxUpsert(queryClient, scope, userId, item);
  } else {
    applyReviewInboxRemove(queryClient, scope, userId, {
      taskAssignmentId: item.taskAssignmentId,
      questionId: item.id,
    });
  }

  applyReviewAssignedUpsert(queryClient, scope, userId, item);
};

export const applyReviewRealtimeEvent = (
  queryClient: QueryClient,
  scope: ReviewScope,
  userId: number,
  event: RealtimeForumEvent,
): void => {
  switch (event.type) {
    case 'INBOX_UPSERTED': {
      const { question } = event.payload;

      if (
        question.id !== event.questionId ||
        question.taskAssignmentId !== event.taskAssignmentId
      ) {
        return;
      }

      applyReviewInboxUpsert(queryClient, scope, userId, question);
      return;
    }

    case 'INBOX_REMOVED':
      if (
        event.payload.questionId !== event.questionId ||
        event.payload.taskAssignmentId !== event.taskAssignmentId
      ) {
        return;
      }

      applyReviewInboxRemove(queryClient, scope, userId, event.payload);
      return;

    case 'REVIEW_UPDATED': {
      const { question } = event.payload;

      if (
        question.id !== event.questionId ||
        question.taskAssignmentId !== event.taskAssignmentId
      ) {
        return;
      }

      updateQuestionDetailsFromSummary(queryClient, userId, question);
      applyReviewAssignedUpsert(queryClient, scope, userId, question);
      return;
    }

    default:
      return;
  }
};
