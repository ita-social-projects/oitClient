export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type StageScope =
  | 'CITY'
  | 'DISTRICT'
  | 'REGIONAL'
  | 'STATE'
  | 'NATIONAL'
  | 'FOREIGN'
  | 'OPEN';

export interface CompetitionSummary {
  id: number;
  title: string;
}

export interface StageSummary {
  id: number;
  title: string;
  scope: StageScope;
}

export interface InvitationHistoryItem {
  invitationId: number;
  issuedAt: string;
  status: RequestStatus;
  competition: CompetitionSummary;
  stage: StageSummary;
  rejectionReason?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface GetInvitationsParams {
  status?: RequestStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RejectEnrollmentRequest {
  rejectionReason?: string | null;
}

export interface ProcessInvitationResponse {
  id: number;
  competitionId: number;
  stageId: number;
  studentId: number;
  issuedBy: number;
  issuedAt: string;
  processedAt: string;
  status: RequestStatus;
  rejectionReason?: string | null;
}
