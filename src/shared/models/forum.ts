type ValueOf<T> = T[keyof T];

export type IsoDateTime = string;

export const QuestionStatus = {
  NEW: 'NEW',
  IN_REVIEW: 'IN_REVIEW',
  ANSWERED: 'ANSWERED',
} as const;

export type QuestionStatus = ValueOf<typeof QuestionStatus>;

export const QuestionState = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export type QuestionState = ValueOf<typeof QuestionState>;

export const QuestionVisibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
} as const;

export type QuestionVisibility = ValueOf<typeof QuestionVisibility>;

export const QuestionMessageType = {
  COMMENT: 'COMMENT',
  OFFICIAL_ANSWER: 'OFFICIAL_ANSWER',
} as const;

export type QuestionMessageType = ValueOf<typeof QuestionMessageType>;

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
}

export interface AssignedQuestionsParams extends PageParams {
  status?: QuestionStatus;
}

export type ReviewScope = 'admin' | 'org';

export interface QuestionThreadResponseDTO {
  id: number;
  taskAssignmentId: number;
  authorId: number;
  assignedReviewerId: number | null;
  title: string;
  content: string;
  status: QuestionStatus;
  visibility: QuestionVisibility;
  state: QuestionState;
  version: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface QuestionThreadSummaryResponseDTO {
  id: number;
  taskAssignmentId: number;
  authorId: number;
  title: string;
  status: QuestionStatus;
  visibility: QuestionVisibility;
  state: QuestionState;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface QuestionReviewInboxItemResponseDTO {
  id: number;
  taskAssignmentId: number;
  authorId: number;
  assignedReviewerId: number | null;
  title: string;
  status: QuestionStatus;
  state: QuestionState;
  visibility: QuestionVisibility;
  version: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface QuestionMessageResponseDTO {
  id: number;
  questionThreadId: number;
  authorId: number;
  type: QuestionMessageType;
  content: string;
  createdAt: IsoDateTime;
}

export interface TaskAssignmentForumResponderResponseDTO {
  id: number;
  taskAssignmentId: number;
  responderUserId: number;
  responderEmail: string;
  responderFirstName: string;
  responderLastName: string;
  assignedByUserId: number;
  assignedAt: IsoDateTime;
}

export interface CreateQuestionRequest {
  title: string;
  content: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateOfficialAnswerRequest {
  content: string;
}

export interface ClaimQuestionRequest {
  version: number;
}

export interface UpdateQuestionVisibilityRequest {
  visibility: QuestionVisibility;
  version: number;
}

export interface UpdateQuestionStatusRequest {
  status: QuestionStatus;
  version: number;
}

export interface UpdateQuestionStateRequest {
  state: QuestionState;
  version: number;
}

export const RealtimeEventType = {
  QUESTION_UPSERTED: 'QUESTION_UPSERTED',
  QUESTION_REMOVED: 'QUESTION_REMOVED',
  MESSAGE_CREATED: 'MESSAGE_CREATED',
  INBOX_UPSERTED: 'INBOX_UPSERTED',
  INBOX_REMOVED: 'INBOX_REMOVED',
  REVIEW_UPDATED: 'REVIEW_UPDATED',
  ACCESS_REVOKED: 'ACCESS_REVOKED',
} as const;

export type RealtimeEventType = ValueOf<typeof RealtimeEventType>;

export interface QuestionUpsertPayload {
  question: QuestionThreadResponseDTO;
}

export interface QuestionRemovalPayload {
  taskAssignmentId: number;
  questionId: number;
}

export interface MessageCreatedPayload {
  message: QuestionMessageResponseDTO;
}

export interface InboxUpsertPayload {
  question: QuestionReviewInboxItemResponseDTO;
}

export interface InboxRemovalPayload {
  taskAssignmentId: number;
  questionId: number;
}

export interface ReviewUpdatePayload {
  question: QuestionReviewInboxItemResponseDTO;
}

export interface AccessRevokedPayload {
  taskAssignmentId: number;
  questionId: number;
}

interface RealtimeForumEventBase<TType extends RealtimeEventType, TPayload> {
  eventId: string;
  type: TType;
  occurredAt: IsoDateTime;
  taskAssignmentId: number;
  questionId: number;
  payload: TPayload;
}

export type RealtimeForumEvent =
  | RealtimeForumEventBase<typeof RealtimeEventType.QUESTION_UPSERTED, QuestionUpsertPayload>
  | RealtimeForumEventBase<typeof RealtimeEventType.QUESTION_REMOVED, QuestionRemovalPayload>
  | RealtimeForumEventBase<typeof RealtimeEventType.MESSAGE_CREATED, MessageCreatedPayload>
  | RealtimeForumEventBase<typeof RealtimeEventType.INBOX_UPSERTED, InboxUpsertPayload>
  | RealtimeForumEventBase<typeof RealtimeEventType.INBOX_REMOVED, InboxRemovalPayload>
  | RealtimeForumEventBase<typeof RealtimeEventType.REVIEW_UPDATED, ReviewUpdatePayload>
  | RealtimeForumEventBase<typeof RealtimeEventType.ACCESS_REVOKED, AccessRevokedPayload>;
