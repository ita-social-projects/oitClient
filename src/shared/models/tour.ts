export type ExecutionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'CLOSED'
  | 'FINISHED'
  | 'CANCELLED';

export const EXECUTION_STATUSES: ExecutionStatus[] = [
  'SCHEDULED',
  'IN_PROGRESS',
  'CLOSED',
  'FINISHED',
  'CANCELLED',
];

export interface TourResponse {
  id: number;
  stageId: number;
  title: string;
  description: string | null;
  dateStart: string; // ISO-8601 UTC
  dateFinish: string; // ISO-8601 UTC
  sortPosition: number;
  location: string;
  executionStatus: ExecutionStatus;
  version: number;
}

export interface CreateTourRequest {
  title: string;
  description?: string | null;
  dateStart: string; // ISO-8601 UTC
  dateFinish: string; // ISO-8601 UTC
  location: string;
}

export interface UpdateTourRequest {
  title: string;
  description?: string | null;
  dateStart: string; // ISO-8601 UTC
  dateFinish: string; // ISO-8601 UTC
  location: string;
  sortPosition?: number;
  version: number;
}

export interface ChangeTourStatusRequest {
  status: ExecutionStatus;
  version: number;
}

export interface ReorderToursRequest {
  tourIds: number[];
}

export interface TourTreeNode extends TourResponse {
  taskCount?: number;
}
