export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface UserSummary {
  firstName: string;
  surname: string;
  email: string;
}

export interface ApplicationListItemResponse {
  applicationId: number;
  issuedAt: string;
  status: RequestStatus;
  user: UserSummary;
}

export interface ProcessApplicationResponse {
  id: number;
  competitionId: number;
  stageId: number;
  issuedBy: number;
  issuedAt: string;
  processedAt: string;
  status: RequestStatus;
  rejectionReason?: string | null;
  processedBy: number;
}

export interface AcceptedApplicationListResponse {
  application: {
    competitionId: number;
    stageId: number;
    processedBy: number;
    processedAt: string;
  };
  succeeded: {
    applicationId: number;
    participantId: number;
    status: RequestStatus;
  }[];
  failed: {
    applicationId: number;
    reason: string;
  }[];
}

export interface RejectedApplicationListResponse {
  application: {
    competitionId: number;
    stageId: number;
    processedBy: number;
    processedAt: string;
  };
  succeeded: {
    applicationId: number;
    studentId: number;
    status: RequestStatus;
  }[];
  failed: {
    applicationId: number;
    reason: string;
  }[];
}

export interface CreateInvitationResponse {
  competitionId: number;
  stageId: number;
  issuedBy: number;
  issuedAt: string;
  succeeded: {
    id: number;
    studentId: number;
  }[];
  failed: {
    studentId: number;
    reason: string;
  }[];
}

export interface InvitationListItemResponse {
  invitationId: number;
  issuedAt: string;
  status: RequestStatus;
  user: UserSummary;
}

export interface ParticipationListItemResponse {
  participationId: number;
  studentId: number;
  user: UserSummary;
}

export interface EligibleStudentResponse {
  id: number;
  firstName: string;
  surname: string;
  email: string;
}

export interface EligibleStudentsParams {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface EnrollmentListParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
  pageNumber?: number;
  pageSize?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export type ApplicationPageResponse = PageResponse<ApplicationListItemResponse>;
export type InvitationPageResponse = PageResponse<InvitationListItemResponse>;
export type ParticipationPageResponse = PageResponse<ParticipationListItemResponse>;

export type StageScope =
  | 'CITY'
  | 'DISTRICT'
  | 'REGIONAL'
  | 'STATE'
  | 'NATIONAL'
  | 'FOREIGN'
  | 'OPEN';

export type ApplicationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export interface UserApplicationSummary {
  id: number;
  status: ApplicationStatus;
}

export interface CompetitionDetail {
  id: number;
  title: string;
  description?: string | null;
  dateStart: string;
  dateFinish: string;
  competitionStatus?: string;
}

export interface StageDetail {
  id: number;
  competitionId?: number;
  title: string;
  description?: string | null;
  dateStart: string;
  dateFinish: string;
  scope: StageScope;
  sortPosition?: number;
}

export interface OpenCompetitionEnrollmentResponse {
  competition: CompetitionDetail;
  stage: StageDetail;
  userApplication: UserApplicationSummary | null;
  isParticipant: boolean;
}

export type OpenCompetitionEnrollment = OpenCompetitionEnrollmentResponse;

export interface CreateApplicationResponse {
  id: number;
  competitionId: number;
  stageId: number;
  issuedBy: number;
  status: ApplicationStatus;
}

export interface CancelApplicationResponse {
  id: number;
  status: ApplicationStatus;
  processedAt: string;
  processedBy: number;
}


