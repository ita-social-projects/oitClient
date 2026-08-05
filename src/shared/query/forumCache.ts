import type {
  QuestionMessageResponseDTO,
  QuestionReviewInboxItemResponseDTO,
  QuestionThreadResponseDTO,
  QuestionThreadSummaryResponseDTO,
} from '@shared/models/forum';

/**
 * Participant list entries come from a summary endpoint without a version.
 * Once a full question snapshot is applied, the version is retained in cache
 * and used to reject stale subsequent updates.
 */
export type QuestionCacheItem = QuestionThreadSummaryResponseDTO & {
  version?: number;
};

const findById = <T extends { id: number }>(items: T[], id: number) =>
  items.findIndex((item) => item.id === id);

const removeById = <T extends { id: number }>(items: T[], id: number): T[] => {
  const index = findById(items, id);

  if (index === -1) {
    return items;
  }

  return [...items.slice(0, index), ...items.slice(index + 1)];
};

const isNewerVersion = (
  currentVersion: number | undefined,
  incomingVersion: number,
) => currentVersion === undefined || incomingVersion > currentVersion;

const toQuestionCacheItem = (
  question: QuestionThreadResponseDTO,
): QuestionCacheItem => ({
  id: question.id,
  taskAssignmentId: question.taskAssignmentId,
  authorId: question.authorId,
  title: question.title,
  status: question.status,
  visibility: question.visibility,
  state: question.state,
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
  version: question.version,
});

/**
 * Inserts a newly created question at the start of the participant list or
 * replaces an existing item only when the incoming snapshot has a newer
 * version. The participant forum is ordered by createdAt DESC and id DESC.
 */
export const upsertQuestion = (
  questions: QuestionCacheItem[],
  question: QuestionThreadResponseDTO,
): QuestionCacheItem[] => {
  const index = findById(questions, question.id);
  const cacheItem = toQuestionCacheItem(question);

  if (index === -1) {
    return [cacheItem, ...questions];
  }

  if (!isNewerVersion(questions[index].version, question.version)) {
    return questions;
  }

  const nextQuestions = [...questions];
  nextQuestions[index] = cacheItem;
  return nextQuestions;
};

/** Removes a participant question when present and is a no-op otherwise. */
export const removeQuestion = (
  questions: QuestionCacheItem[],
  questionId: number,
): QuestionCacheItem[] => removeById(questions, questionId);

/**
 * Appends a message exactly once. Message ids are immutable delivery-level
 * deduplication keys, so an already cached id is never appended or replaced.
 */
export const appendMessage = (
  messages: QuestionMessageResponseDTO[],
  message: QuestionMessageResponseDTO,
): QuestionMessageResponseDTO[] => {
  if (findById(messages, message.id) !== -1) {
    return messages;
  }

  return [...messages, message];
};

/**
 * Inserts a new inbox item at the end of the oldest-first inbox or replaces an
 * existing item in place only when its version is newer.
 */
export const upsertInboxItem = (
  inbox: QuestionReviewInboxItemResponseDTO[],
  item: QuestionReviewInboxItemResponseDTO,
): QuestionReviewInboxItemResponseDTO[] => {
  const index = findById(inbox, item.id);

  if (index === -1) {
    return [...inbox, item];
  }

  if (!isNewerVersion(inbox[index].version, item.version)) {
    return inbox;
  }

  const nextInbox = [...inbox];
  nextInbox[index] = item;
  return nextInbox;
};

/** Removes an inbox item when present and is a no-op otherwise. */
export const removeInboxItem = (
  inbox: QuestionReviewInboxItemResponseDTO[],
  questionId: number,
): QuestionReviewInboxItemResponseDTO[] => removeById(inbox, questionId);

/**
 * Inserts or promotes an assigned review item to the start of the updatedAt
 * descending list. Equal and stale versions are ignored.
 */
export const upsertReviewItem = (
  reviews: QuestionReviewInboxItemResponseDTO[],
  item: QuestionReviewInboxItemResponseDTO,
): QuestionReviewInboxItemResponseDTO[] => {
  const index = findById(reviews, item.id);

  if (index === -1) {
    return [item, ...reviews];
  }

  if (!isNewerVersion(reviews[index].version, item.version)) {
    return reviews;
  }

  return [item, ...reviews.slice(0, index), ...reviews.slice(index + 1)];
};

/** Removes an assigned review item when present and is a no-op otherwise. */
export const removeReviewItem = (
  reviews: QuestionReviewInboxItemResponseDTO[],
  questionId: number,
): QuestionReviewInboxItemResponseDTO[] => removeById(reviews, questionId);
