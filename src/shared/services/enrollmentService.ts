import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  AcceptedApplicationListResponse,
  ApplicationListItemResponse,
  CancelApplicationResponse,
  CreateApplicationResponse,
  CreateInvitationResponse,
  EligibleStudentResponse,
  EligibleStudentsParams,
  EnrollmentListParams,
  InvitationListItemResponse,
  OpenCompetitionEnrollmentResponse,
  PageResponse,
  ParticipationListItemResponse,
  ProcessApplicationResponse,
  RejectedApplicationListResponse,
} from '@shared/models/enrollment';

export const enrollmentService = {
  getStageApplications: async (
    competitionId: number,
    stageId: number,
    params?: EnrollmentListParams
  ): Promise<PageResponse<ApplicationListItemResponse>> => {
    const { data } = await axiosInstance.get<PageResponse<ApplicationListItemResponse>>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}/applications`,
      { params }
    );
    return data;
  },

  acceptApplication: async (applicationId: number): Promise<ProcessApplicationResponse> => {
    const { data } = await axiosInstance.post<ProcessApplicationResponse>(
      `/api/v1/enrollment/applications/${applicationId}/accept`
    );
    return data;
  },

  acceptApplicationsBatch: async (
    applicationIds: number[]
  ): Promise<AcceptedApplicationListResponse> => {
    const { data } = await axiosInstance.post<AcceptedApplicationListResponse>(
      '/api/v1/enrollment/applications/accept-batch',
      { applicationIds }
    );
    return data;
  },

  rejectApplication: async (
    applicationId: number,
    rejectionReason?: string
  ): Promise<ProcessApplicationResponse> => {
    const { data } = await axiosInstance.patch<ProcessApplicationResponse>(
      `/api/v1/enrollment/applications/${applicationId}/reject`,
      { rejectionReason }
    );
    return data;
  },

  rejectApplicationsBatch: async (
    applicationIds: number[],
    rejectionReason?: string
  ): Promise<RejectedApplicationListResponse> => {
    const { data } = await axiosInstance.post<RejectedApplicationListResponse>(
      '/api/v1/enrollment/applications/reject-batch',
      { applicationIds, rejectionReason }
    );
    return data;
  },

  sendInvitations: async (
    competitionId: number,
    stageId: number,
    studentIds: number[]
  ): Promise<CreateInvitationResponse> => {
    const { data } = await axiosInstance.post<CreateInvitationResponse>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}/invitations`,
      { studentIds }
    );
    return data;
  },

  getEligibleStudents: async (
    competitionId: number,
    stageId: number,
    params?: EligibleStudentsParams
  ): Promise<PageResponse<EligibleStudentResponse>> => {
    const { data } = await axiosInstance.get<PageResponse<EligibleStudentResponse>>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}/invitations/eligible-students`,
      { params }
    );
    return data;
  },

  getStageInvitations: async (
    competitionId: number,
    stageId: number,
    params?: EnrollmentListParams
  ): Promise<PageResponse<InvitationListItemResponse>> => {
    const { data } = await axiosInstance.get<PageResponse<InvitationListItemResponse>>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}/invitations`,
      { params }
    );
    return data;
  },

  cancelInvitation: async (invitationId: number): Promise<ProcessApplicationResponse> => {
    const { data } = await axiosInstance.patch<ProcessApplicationResponse>(
      `/api/v1/enrollment/invitations/${invitationId}/cancel`
    );
    return data;
  },

  getStageParticipants: async (
    competitionId: number,
    stageId: number,
    params?: EnrollmentListParams
  ): Promise<PageResponse<ParticipationListItemResponse>> => {
    const { data } = await axiosInstance.get<PageResponse<ParticipationListItemResponse>>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}/participants`,
      { params }
    );
    return data;
  },

  getOpenCompetitions: async (): Promise<OpenCompetitionEnrollmentResponse[]> => {
    const { data } = await axiosInstance.get<OpenCompetitionEnrollmentResponse[]>(
      '/api/v1/competitions/enrollment-open'
    );
    return data;
  },

  applyToCompetition: async (
    competitionId: number,
    stageId: number
  ): Promise<CreateApplicationResponse> => {
    const { data } = await axiosInstance.post<CreateApplicationResponse>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}/applications`
    );
    return data;
  },

  cancelUserApplication: async (
    applicationId: number
  ): Promise<CancelApplicationResponse> => {
    const { data } = await axiosInstance.patch<CancelApplicationResponse>(
      `/api/v1/enrollment/applications/${applicationId}/cancel`
    );
    return data;
  },
};

