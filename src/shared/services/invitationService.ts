import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  GetInvitationsParams,
  InvitationHistoryItem,
  PageResponse,
  ProcessInvitationResponse,
  RejectEnrollmentRequest,
} from '@shared/models/invitation';

export const invitationService = {
  getUserInvitations: async (
    userId: number,
    params?: GetInvitationsParams
  ): Promise<PageResponse<InvitationHistoryItem>> => {
    const { data } = await axiosInstance.get<PageResponse<InvitationHistoryItem>>(
      `/api/v1/users/${userId}/invitations`,
      { params }
    );
    return data;
  },

  acceptInvitation: async (id: number): Promise<ProcessInvitationResponse> => {
    const { data } = await axiosInstance.post<ProcessInvitationResponse>(
      `/api/v1/enrollment/invitations/${id}/accept`
    );
    return data;
  },

  rejectInvitation: async (
    id: number,
    body?: RejectEnrollmentRequest
  ): Promise<ProcessInvitationResponse> => {
    const { data } = await axiosInstance.patch<ProcessInvitationResponse>(
      `/api/v1/enrollment/invitations/${id}/reject`,
      body
    );
    return data;
  },
};
