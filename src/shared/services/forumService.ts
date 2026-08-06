import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  AssignedQuestionsParams,
  ClaimQuestionRequest,
  CreateCommentRequest,
  CreateOfficialAnswerRequest,
  CreateQuestionRequest,
  PageParams,
  PageResponse,
  QuestionMessageResponseDTO,
  QuestionReviewInboxItemResponseDTO,
  QuestionThreadResponseDTO,
  QuestionThreadSummaryResponseDTO,
  TaskAssignmentForumResponderResponseDTO,
  UpdateQuestionStateRequest,
  UpdateQuestionStatusRequest,
  UpdateQuestionVisibilityRequest,
} from '@shared/models/forum';

const participantForumPath = (taskAssignmentId: number) =>
  `/api/v1/task-assignments/${taskAssignmentId}/questions`;

const questionPath = (questionId: number) => `/api/v1/questions/${questionId}`;

const reviewerQuestionsPath = (scope: 'admin' | 'org') => `/api/v1/${scope}/questions`;

const responderPath = (taskAssignmentId: number) =>
  `/api/v1/admin/task-assignments/${taskAssignmentId}/forum-responders`;

const getReviewInbox = async (scope: 'admin' | 'org', params?: PageParams) => {
  const { data } = await axiosInstance.get<PageResponse<QuestionReviewInboxItemResponseDTO>>(
    `${reviewerQuestionsPath(scope)}/inbox`,
    {
      params,
    },
  );

  return data;
};

const getAssignedQuestions = async (scope: 'admin' | 'org', params?: AssignedQuestionsParams) => {
  const { data } = await axiosInstance.get<PageResponse<QuestionReviewInboxItemResponseDTO>>(
    `${reviewerQuestionsPath(scope)}/assigned-to-me`,
    {
      params,
    },
  );

  return data;
};

const claimQuestion = async (
  scope: 'admin' | 'org',
  questionId: number,
  request: ClaimQuestionRequest,
) => {
  const { data } = await axiosInstance.post<QuestionThreadResponseDTO>(
    `${reviewerQuestionsPath(scope)}/${questionId}/claim`,
    request,
  );

  return data;
};

const publishOfficialAnswer = async (
  scope: 'admin' | 'org',
  questionId: number,
  request: CreateOfficialAnswerRequest,
) => {
  const { data } = await axiosInstance.post<QuestionMessageResponseDTO>(
    `${reviewerQuestionsPath(scope)}/${questionId}/official-answers`,
    request,
  );

  return data;
};

const updateQuestionVisibility = async (
  scope: 'admin' | 'org',
  questionId: number,
  request: UpdateQuestionVisibilityRequest,
) => {
  const { data } = await axiosInstance.patch<QuestionThreadResponseDTO>(
    `${reviewerQuestionsPath(scope)}/${questionId}/visibility`,
    request,
  );

  return data;
};

const updateQuestionStatus = async (
  scope: 'admin' | 'org',
  questionId: number,
  request: UpdateQuestionStatusRequest,
) => {
  const { data } = await axiosInstance.patch<QuestionThreadResponseDTO>(
    `${reviewerQuestionsPath(scope)}/${questionId}/status`,
    request,
  );

  return data;
};

const updateQuestionState = async (
  scope: 'admin' | 'org',
  questionId: number,
  request: UpdateQuestionStateRequest,
) => {
  const { data } = await axiosInstance.patch<QuestionThreadResponseDTO>(
    `${reviewerQuestionsPath(scope)}/${questionId}/state`,
    request,
  );

  return data;
};

export const reviewForumService = {
  getInbox: getReviewInbox,
  getAssignedQuestions,
  claimQuestion,
  publishOfficialAnswer,
  updateQuestionVisibility,
  updateQuestionStatus,
  updateQuestionState,
};

export const forumService = {
  getParticipantQuestions: async (taskAssignmentId: number, params?: PageParams) => {
    const { data } = await axiosInstance.get<PageResponse<QuestionThreadSummaryResponseDTO>>(
      participantForumPath(taskAssignmentId),
      {
        params,
      },
    );

    return data;
  },

  createQuestion: async (taskAssignmentId: number, request: CreateQuestionRequest) => {
    const { data } = await axiosInstance.post<QuestionThreadResponseDTO>(
      participantForumPath(taskAssignmentId),
      request,
    );

    return data;
  },

  getQuestionDetails: async (questionId: number) => {
    const { data } = await axiosInstance.get<QuestionThreadResponseDTO>(questionPath(questionId));

    return data;
  },

  getQuestionMessages: async (questionId: number, params?: PageParams) => {
    const { data } = await axiosInstance.get<PageResponse<QuestionMessageResponseDTO>>(
      `${questionPath(questionId)}/messages`,
      {
        params,
      },
    );

    return data;
  },

  addComment: async (questionId: number, request: CreateCommentRequest) => {
    const { data } = await axiosInstance.post<QuestionMessageResponseDTO>(
      `${questionPath(questionId)}/comments`,
      request,
    );

    return data;
  },

  getAdminInbox: (params?: PageParams) => getReviewInbox('admin', params),

  getAdminAssignedQuestions: (params?: AssignedQuestionsParams) =>
    getAssignedQuestions('admin', params),

  claimAdminQuestion: (questionId: number, request: ClaimQuestionRequest) =>
    claimQuestion('admin', questionId, request),

  publishAdminOfficialAnswer: (questionId: number, request: CreateOfficialAnswerRequest) =>
    publishOfficialAnswer('admin', questionId, request),

  updateAdminQuestionVisibility: (questionId: number, request: UpdateQuestionVisibilityRequest) =>
    updateQuestionVisibility('admin', questionId, request),

  updateAdminQuestionStatus: (questionId: number, request: UpdateQuestionStatusRequest) =>
    updateQuestionStatus('admin', questionId, request),

  updateAdminQuestionState: (questionId: number, request: UpdateQuestionStateRequest) =>
    updateQuestionState('admin', questionId, request),

  getOrgInbox: (params?: PageParams) => getReviewInbox('org', params),

  getOrgAssignedQuestions: (params?: AssignedQuestionsParams) =>
    getAssignedQuestions('org', params),

  claimOrgQuestion: (questionId: number, request: ClaimQuestionRequest) =>
    claimQuestion('org', questionId, request),

  publishOrgOfficialAnswer: (questionId: number, request: CreateOfficialAnswerRequest) =>
    publishOfficialAnswer('org', questionId, request),

  updateOrgQuestionVisibility: (questionId: number, request: UpdateQuestionVisibilityRequest) =>
    updateQuestionVisibility('org', questionId, request),

  updateOrgQuestionStatus: (questionId: number, request: UpdateQuestionStatusRequest) =>
    updateQuestionStatus('org', questionId, request),

  updateOrgQuestionState: (questionId: number, request: UpdateQuestionStateRequest) =>
    updateQuestionState('org', questionId, request),

  getForumResponders: async (taskAssignmentId: number, params?: PageParams) => {
    const { data } = await axiosInstance.get<PageResponse<TaskAssignmentForumResponderResponseDTO>>(
      responderPath(taskAssignmentId),
      {
        params,
      },
    );

    return data;
  },

  grantForumResponder: async (taskAssignmentId: number, userId: number) => {
    const response =
      await axiosInstance.put<TaskAssignmentForumResponderResponseDTO>(
        `${responderPath(taskAssignmentId)}/${userId}`,
      );

    return {
      responder: response.data,
      created: response.status === 201,
    };
  },

  revokeForumResponder: async (taskAssignmentId: number, userId: number) => {
    await axiosInstance.delete(`${responderPath(taskAssignmentId)}/${userId}`);
  },
};
