export type CompetitionStatus = 'DRAFT' | 'ENROLLMENT' | 'PUBLISHED' | 'FINISHED' | 'ARCHIVED';

export const COMPETITION_STATUSES: CompetitionStatus[] = [
  'DRAFT',
  'ENROLLMENT',
  'PUBLISHED',
  'FINISHED',
  'ARCHIVED',
];

export interface CompetitionResponse {
  id: number;
  title: string;
  description: string | null;
  dateStart: string; // ISO 8601
  dateFinish: string; // ISO 8601
  competitionStatus: CompetitionStatus;
  createdBy: number;
  updatedBy: number | null;
  createdAt?: string;
  updatedAt?: string | null;
  version: number;
}

export interface CreateCompetitionRequest {
  title: string;
  description?: string | null;
  dateStart: string; // ISO 8601
  dateFinish: string; // ISO 8601
}

export interface UpdateCompetitionRequest extends CreateCompetitionRequest {
  version: number;
}

export interface ChangeCompetitionStatusRequest {
  status: CompetitionStatus;
  version: number;
}

export interface CompetitionListParams {
  page?: number;
  size?: number;
  title?: string;
  statuses?: CompetitionStatus[];
  dateStart?: string;
  dateFinish?: string;
  sort?: string;
}

export interface CompetitionPageResponse {
  content: CompetitionResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}
