import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  AcceptedApplicationListResponse,
  ApplicationListItemResponse,
  CreateInvitationResponse,
  EnrollmentListParams,
  InvitationListItemResponse,
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
};

