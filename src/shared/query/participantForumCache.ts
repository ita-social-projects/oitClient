import {
  RealtimeEventType,
  type AccessRevokedPayload,
  type PageResponse,
  type QuestionMessageResponseDTO,
  type QuestionThreadResponseDTO,
  type RealtimeForumEvent,
} from '@shared/models/forum';
import type { QueryClient, QueryKey } from '@tanstack/react-query';

import {
  appendMessage,
  removeQuestion,
  upsertQuestion,
  type QuestionCacheItem,
} from './forumCache';
import { forumKeys } from './forumKeys';

export const PARTICIPANT_MESSAGE_PAGE_SIZE = 50;

type ParticipantQuestionPage = PageResponse<QuestionCacheItem>;
type ParticipantMessagePage = PageResponse<QuestionMessageResponseDTO>;

type CachedQuery<T> = readonly [QueryKey, T | undefined];

const totalPagesFor = (totalElements: number, pageSize: number) =>
  totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);

const withTotalElements = <T>(
  page: PageResponse<T>,
  totalElements: number,
): PageResponse<T> => {
  const totalPages = totalPagesFor(totalElements, page.pageSize);

  return {
    ...page,
    totalElements,
    totalPages,
    first: page.pageNumber === 0,
    last: totalPages === 0 || page.pageNumber >= totalPages - 1,
  };
};

const getParticipantQuestionPages = (
  queryClient: QueryClient,
  userId: number,
  taskAssignmentId: number,
): CachedQuery<ParticipantQuestionPage>[] =>
  queryClient.getQueriesData<ParticipantQuestionPage>({
    queryKey: forumKeys.participantLists(userId, taskAssignmentId),
  });

const getParticipantMessagePages = (
  queryClient: QueryClient,
  userId: number,
  questionId: number,
): CachedQuery<ParticipantMessagePage>[] =>
  queryClient.getQueriesData<ParticipantMessagePage>({
    queryKey: forumKeys.messageLists(userId, questionId),
  });

const findCachedQuestion = (
  pages: CachedQuery<ParticipantQuestionPage>[],
  questionId: number,
) =>
  pages
    .flatMap(([, page]) => page?.content ?? [])
    .find((question) => question.id === questionId);

const compareQuestionsNewestFirst = (
  left: QuestionCacheItem,
  right: QuestionCacheItem,
) => {
  const createdAtComparison = right.createdAt.localeCompare(left.createdAt);

  return createdAtComparison !== 0 ? createdAtComparison : right.id - left.id;
};

const belongsToFirstPage = (
  page: ParticipantQuestionPage,
  question: QuestionThreadResponseDTO,
) => {
  if (page.pageNumber !== 0) {
    return false;
  }

  if (page.content.length < page.pageSize) {
    return true;
  }

  const lastQuestion = page.content.at(-1);

  return lastQuestion
    ? compareQuestionsNewestFirst(question, lastQuestion) < 0
    : true;
};

const currentQuestionVersion = (
  queryClient: QueryClient,
  userId: number,
  question: QuestionThreadResponseDTO,
  pages: CachedQuery<ParticipantQuestionPage>[],
) => {
  const detailVersion = queryClient.getQueryData<QuestionThreadResponseDTO>(
    forumKeys.question(userId, question.id),
  )?.version;
  const listVersion = findCachedQuestion(pages, question.id)?.version;

  return Math.max(detailVersion ?? -1, listVersion ?? -1);
};

const isCurrentUserQuestion = (
  queryClient: QueryClient,
  userId: number,
  taskAssignmentId: number,
  questionId: number,
) => {
  const question = queryClient.getQueryData<QuestionThreadResponseDTO>(
    forumKeys.question(userId, questionId),
  );

  if (question?.authorId === userId) {
    return true;
  }

  return getParticipantQuestionPages(queryClient, userId, taskAssignmentId).some(
    ([, page]) =>
      page?.content.some(
        (item) => item.id === questionId && item.authorId === userId,
      ) ?? false,
  );
};

export const applyParticipantQuestionUpsert = (
  queryClient: QueryClient,
  userId: number,
  question: QuestionThreadResponseDTO,
): boolean => {
  const pages = getParticipantQuestionPages(
    queryClient,
    userId,
    question.taskAssignmentId,
  );
  const cachedVersion = currentQuestionVersion(
    queryClient,
    userId,
    question,
    pages,
  );

  if (question.version < cachedVersion) {
    return false;
  }

  let changed = false;
  const questionKey = forumKeys.question(userId, question.id);
  const currentDetail = queryClient.getQueryData<QuestionThreadResponseDTO>(
    questionKey,
  );

  if (!currentDetail || question.version > currentDetail.version) {
    queryClient.setQueryData(questionKey, question);
    changed = true;
  }

  const revokedKey = forumKeys.questionAccessRevoked(userId, question.id);

  if (queryClient.getQueryData<AccessRevokedPayload>(revokedKey)) {
    queryClient.setQueryData<AccessRevokedPayload | null>(revokedKey, null);
    changed = true;
  }

  const listedPageSizes = new Set(
    pages
      .filter(([, page]) =>
        page?.content.some((item) => item.id === question.id),
      )
      .map(([, page]) => page!.pageSize),
  );

  pages.forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    const containsQuestion = page.content.some((item) => item.id === question.id);

    if (containsQuestion) {
      const content = upsertQuestion(page.content, question);

      if (content !== page.content) {
        queryClient.setQueryData(queryKey, {
          ...page,
          content,
        });
        changed = true;
      }

      return;
    }

    if (
      listedPageSizes.has(page.pageSize) ||
      !belongsToFirstPage(page, question)
    ) {
      return;
    }

    const content = upsertQuestion(page.content, question)
      .sort(compareQuestionsNewestFirst)
      .slice(0, page.pageSize);
    const updatedPage = withTotalElements(page, page.totalElements + 1);

    queryClient.setQueryData(queryKey, {
      ...updatedPage,
      content,
    });
    changed = true;
  });

  return changed;
};

export const applyParticipantAccessRevoked = (
  queryClient: QueryClient,
  userId: number,
  payload: AccessRevokedPayload,
): boolean => {
  if (
    isCurrentUserQuestion(
      queryClient,
      userId,
      payload.taskAssignmentId,
      payload.questionId,
    )
  ) {
    return false;
  }

  const revokedKey = forumKeys.questionAccessRevoked(userId, payload.questionId);

  if (queryClient.getQueryData<AccessRevokedPayload>(revokedKey)) {
    return false;
  }

  queryClient.setQueryData(revokedKey, payload);
  queryClient.removeQueries({
    queryKey: forumKeys.pendingMessages(userId, payload.questionId),
    exact: true,
  });

  getParticipantQuestionPages(
    queryClient,
    userId,
    payload.taskAssignmentId,
  ).forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    const content = removeQuestion(page.content, payload.questionId);

    if (content === page.content) {
      return;
    }

    const updatedPage = withTotalElements(
      page,
      Math.max(0, page.totalElements - 1),
    );

    queryClient.setQueryData(queryKey, {
      ...updatedPage,
      content,
    });
  });

  return true;
};

const getPendingMessages = (
  queryClient: QueryClient,
  userId: number,
  questionId: number,
) =>
  queryClient.getQueryData<QuestionMessageResponseDTO[]>(
    forumKeys.pendingMessages(userId, questionId),
  ) ?? [];

const bufferPendingMessage = (
  queryClient: QueryClient,
  userId: number,
  message: QuestionMessageResponseDTO,
) => {
  const key = forumKeys.pendingMessages(userId, message.questionThreadId);
  const pendingMessages = getPendingMessages(
    queryClient,
    userId,
    message.questionThreadId,
  );
  const updatedMessages = appendMessage(pendingMessages, message);

  if (updatedMessages !== pendingMessages) {
    queryClient.setQueryData(key, updatedMessages);
  }
};

export const mergePendingParticipantMessages = (
  queryClient: QueryClient,
  userId: number,
  questionId: number,
  page: ParticipantMessagePage,
): ParticipantMessagePage => {
  const pendingMessages = getPendingMessages(queryClient, userId, questionId);

  if (!page.last || pendingMessages.length === 0) {
    return page;
  }

  const content = pendingMessages.reduce(appendMessage, page.content);
  const addedMessages = content.length - page.content.length;

  queryClient.setQueryData(
    forumKeys.pendingMessages(userId, questionId),
    [],
  );

  if (addedMessages === 0) {
    return page;
  }

  return {
    ...withTotalElements(page, page.totalElements + addedMessages),
    content,
  };
};

export const applyParticipantMessageCreated = (
  queryClient: QueryClient,
  userId: number,
  message: QuestionMessageResponseDTO,
): number | null => {
  const pages = getParticipantMessagePages(
    queryClient,
    userId,
    message.questionThreadId,
  );

  for (const [, page] of pages) {
    const existingMessage = page?.content.find((item) => item.id === message.id);

    if (existingMessage) {
      return page?.pageNumber ?? null;
    }
  }

  const lastPageEntry = pages
    .filter((entry): entry is readonly [QueryKey, ParticipantMessagePage] =>
      Boolean(entry[1]?.last),
    )
    .sort(([, left], [, right]) => right.pageNumber - left.pageNumber)[0];

  if (!lastPageEntry) {
    bufferPendingMessage(queryClient, userId, message);
    return null;
  }

  const [lastPageKey, lastPage] = lastPageEntry;
  const newTotalElements = lastPage.totalElements + 1;
  const newTotalPages = totalPagesFor(newTotalElements, lastPage.pageSize);

  pages.forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    queryClient.setQueryData(
      queryKey,
      withTotalElements(page, newTotalElements),
    );
  });

  if (lastPage.content.length < lastPage.pageSize) {
    queryClient.setQueryData(lastPageKey, {
      ...withTotalElements(lastPage, newTotalElements),
      content: appendMessage(lastPage.content, message),
    });

    return lastPage.pageNumber;
  }

  const nextPageNumber = lastPage.pageNumber + 1;

  queryClient.setQueryData(
    forumKeys.messages(
      userId,
      message.questionThreadId,
      nextPageNumber,
      lastPage.pageSize,
    ),
    {
      content: [message],
      pageNumber: nextPageNumber,
      pageSize: lastPage.pageSize,
      totalPages: newTotalPages,
      totalElements: newTotalElements,
      first: false,
      last: true,
    } satisfies ParticipantMessagePage,
  );

  return nextPageNumber;
};

export const applyParticipantRealtimeEvent = (
  queryClient: QueryClient,
  userId: number,
  event: RealtimeForumEvent,
): void => {
  switch (event.type) {
    case RealtimeEventType.QUESTION_UPSERTED: {
      const { question } = event.payload;

      if (
        question.id !== event.questionId ||
        question.taskAssignmentId !== event.taskAssignmentId
      ) {
        return;
      }

      applyParticipantQuestionUpsert(queryClient, userId, question);
      return;
    }

    case RealtimeEventType.QUESTION_REMOVED: {
      if (
        event.payload.questionId !== event.questionId ||
        event.payload.taskAssignmentId !== event.taskAssignmentId
      ) {
        return;
      }

      applyParticipantAccessRevoked(queryClient, userId, event.payload);
      return;
    }

    case RealtimeEventType.MESSAGE_CREATED: {
      if (event.payload.message.questionThreadId !== event.questionId) {
        return;
      }

      applyParticipantMessageCreated(queryClient, userId, event.payload.message);
      return;
    }

    case RealtimeEventType.ACCESS_REVOKED: {
      if (
        event.payload.questionId !== event.questionId ||
        event.payload.taskAssignmentId !== event.taskAssignmentId
      ) {
        return;
      }

      applyParticipantAccessRevoked(queryClient, userId, event.payload);
      return;
    }

    default:
      return;
  }
};
